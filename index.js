var through = require('through2'),
    File = require('vinyl'),
    fs = require('fs');

module.exports = function(fileName, removePackage = false) {
    if (!fileName) {
        throw new Error('gulp-java-merger: No filename given.');
    }

    var package;
    var imports = [];
    var processedCode = [];

    var getFirstClassInterface = function(lines) {
        for (var i = 0, iMax = lines.length; i < iMax; i++) {
            if (lines[i].indexOf('class') !== -1 || lines[i].indexOf('interface') !== -1) {
                return i;
            }
        }
        return -1;
    };

    var processFile = function(file) {
        var lines = file.contents.toString().split('\n');

        var firstIndex = getFirstClassInterface(lines);
        var importEndIndex = -1;
        
        var firstLines = lines.slice(0, firstIndex !== -1 ? firstIndex : lines.length);
        for (var i = 0, iMax = firstLines.length; i < iMax; i++) {
            if (firstLines[i].startsWith('package ') && package === undefined) {
                package = firstLines[i];
                importEndIndex = -1;
            } else if (firstLines[i].startsWith('import ')) {
                imports.push(firstLines[i]);
                importEndIndex = -1;
            } else if (importEndIndex === -1 && firstLines[i] !== '') {
                importEndIndex = i;
            }
        }

        if (firstLines.length !== lines.length) {
            var code = lines.slice(importEndIndex !== -1 ? importEndIndex : 0, lines.length);
            firstIndex = getFirstClassInterface(code);
            if (code[firstIndex] !== undefined && code[firstIndex].startsWith('public ')) {
                code[firstIndex] = code[firstIndex].substr(7);
            }

            code = code.join('\n').trim();

            // http://stackoverflow.com/a/35488648/5841273
            if (code.match(/\s*static\s*void\s*main\s*\(\s*String\s*\[\]\s*[^\)]*\)/)) {
                processedCode.unshift(code);
            } else {
                processedCode.push(code);
            }
        }
    };

    var handleFiles = function(file, encoding, cb) {
        if (file.isNull()) return cb();

        if (file.isStream()) {
            this.emit('error', new Error('gulp-java-merger: Streams are not supported.'));
            return cb();
        }

        processFile(file);
        cb();
    };

    var merge = function(cb) {
        if (package === undefined && imports.length === 0 && processedCode.length === 0) {
            return cb();
        }

        imports = [...new Set(imports)];
        var finalFile = '';

        if (package !== undefined && !removePackage) {
            finalFile += package;
            if (imports.length > 0 || processedCode.length > 0) finalFile += '\n\n';
        }

        finalFile += imports.join('\n');
        if (processedCode.length > 0) {
            if (imports.length > 0) finalFile += '\n\n';
            finalFile += processedCode.join('\n\n');
        }

        cb(null, new File({
            path: fileName,
            contents: new Buffer(finalFile)
        }));
    };

    return through.obj(handleFiles, merge);
};