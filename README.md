# Gulp Java Merger
A gulp plugin to make it easy to merge multiple .java files into one, aswell as automatically removing 'public' from class declarations (one .java file can't have multiple public classes/interfaces) and making sure there are no duplicate imports.

## Usage

First, install `gulp-java-merger` as a development dependency:

```shell
npm install --save-dev gulp-java-merger
```

Then, add it to your `gulpfile.js`:

```javascript
var merge = require('gulp-java-merger');

gulp.task('default', function() {
    gulp.src('input/*.java')
        .pipe(merge('merged.java'))
        .pipe(gulp.dest('output/')); 
});
```

By default, the first package first is added. If you don't want any package line at all, add `false` as second parameter:

```javascript
var merge = require('gulp-java-merger');

gulp.task('default', function() {
    gulp.src('input/*.java')
        .pipe(merge('merged.java'), false)
        .pipe(gulp.dest('output/')); 
});
```