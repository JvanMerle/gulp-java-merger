const fs = require('fs');
const through = require('through2');
const File = require('vinyl');

const defaults = {
  removePackage: false,
  publicMain: false
};

module.exports = function(fileName, options) {
  if (!fileName) {
    throw new Error('gulp-java-merger: No filename given.');
  }

  options = Object.assign({}, defaults, options);

  let package = null;
  let imports = [];
  const processedCode = [];

  const getCodeBeginning = function(lines) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\s*(class|interface|enum)\s*.*\s*{/)) {
        return i;
      }
    }

    return -1;
  };

  const processFile = function(file) {
    const lines = file.contents.toString().trim().split('\n');

    let beginIndex = getCodeBeginning(lines);
    let importEndIndex = -1;

    const firstLines = lines.slice(0, beginIndex !== -1 ? beginIndex : lines.length);
    for (let i = 0; i < firstLines.length; i++) {
      const line = firstLines[i].trim();

      if (line.startsWith('package ')) {
        if (package === null) package = line;
        importEndIndex = -1;
      } else if (line.startsWith('import ')) {
        imports.push(line);
        importEndIndex = -1;
      } else if (importEndIndex === -1) {
        importEndIndex = i;
      }
    }

    if (firstLines.length !== lines.length) {
      let code = lines.slice(importEndIndex !== -1 ? importEndIndex : 0, lines.length);
      
      beginIndex = getCodeBeginning(code);
      let unshift = false;

      if (code[beginIndex] !== undefined && code[beginIndex].startsWith('public ') && !options.publicMain) {
        code[beginIndex] = code[beginIndex].substr(7);
        unshift = true;
      }

      code = code.join('\n').trim();

      if (unshift) {
        processedCode.unshift(code);
      } else {
        processedCode.push(code);
      }
    }
  };

  const handleFiles = function(file, encoding, cb) {
    if (file.isNull()) return cb();

    if (file.isStream()) {
      this.emit('error', new Error('gulp-java-merger: Streams are not supported.'));
      return cb();
    }

    processFile(file);
    cb();
  };

  const merge = function(cb) {
    if (package === null && imports.length === 0 && processedCode.length === 0) {
      return cb();
    }

    imports = [...new Set(imports)];
    
    let finalFile = '';

    if (package !== null && !options.removePackage) {
      finalFile += package + '\n';
    }

    if (imports.length > 0) {
      if (package !== null && !options.removePackage) finalFile += '\n';
      finalFile += imports.join('\n') + '\n';
    }

    if (processedCode.length > 0) {
      if (imports.length > 0 || (package !== null && !options.removePackage)) finalFile += '\n';
      finalFile += processedCode.join('\n\n') + '\n';
    }

    cb(null, new File({
      path: fileName,
      contents: new Buffer(finalFile)
    }));
  };

  return through.obj(handleFiles, merge);
};
