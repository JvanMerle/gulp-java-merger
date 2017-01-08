var merge = require('../'),
    assert = require('stream-assert'),
    should = require('should'),
    gulp = require('gulp');
require('mocha');

// Thanks Contra for the gulp-concat tests, helped me a lot
describe('gulp-java-merger', function() {
    it('should throw when filename is missing', function() {
        merge.should.throw('gulp-java-merger: No filename given.');
    });

    it('should ignore null files', function(done) {
        var stream = merge('nonexistingfile.java');
        stream
            .pipe(assert.length(0))
            .pipe(assert.end(done));
        stream.end();
    });

    it('should emit error on streams', function(done) {
        gulp.src('test/input/*.java', { buffer: false })
            .pipe(merge('merged.java'))
            .once('error', function(err) {
                err.message.should.eql('gulp-java-merger: Streams are not supported.');
                done();
            });
    });

    it('should concat buffers', function(done) {
        gulp.src(['test/input/Foo.java', 'test/input/Bar.java'])
            .pipe(merge('merged.java'))
            .pipe(assert.length(1))
            .pipe(assert.first(function(d) { d.contents.toString().split('\n').length.should.eql(24); }))
            .pipe(assert.end(done));
    });

    it('should make sure there are no duplicate imports', function(done) {
        gulp.src(['test/input/import1.java', 'test/input/import2.java'])
            .pipe(merge('merged.java'))
            .pipe(assert.length(1))
            .pipe(assert.first(function(d) { d.contents.toString().split('\n').length.should.eql(2); }))
            .pipe(assert.end(done));
    });

    it('should not fail if no files were put in', function(done) {
        var stream = merge('merged.java');
        stream.end();
        done();
    });

    describe('options', function() {
        it('should remove the package if second parameter is boolean true', function(done) {
            gulp.src('test/input/withpackage.java')
                .pipe(merge('merged.java', true))
                .pipe(assert.length(1))
                .pipe(assert.first(function(d) { d.contents.toString().split('\n').length.should.eql(4); }))
                .pipe(assert.end(done));
        });
    });
});