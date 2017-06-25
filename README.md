# Gulp Java Merger
[![npm](https://img.shields.io/npm/v/gulp-java-merger.svg)](https://www.npmjs.com/package/gulp-java-merger)

A gulp plugin to make it easy to merge multiple .java files into one, aswell as automatically removing 'public' from class declarations (one .java file can't have multiple public classes/enumerations/interfaces) and making sure there are no duplicate imports.

## Install
Install with [npm](https://www.npmjs.com/).

```bash
npm install --save-dev gulp-java-merger
```

## Example
```javascript
var merge = require('gulp-java-merger');

gulp.task('default', function() {
    gulp.src('input/*.java')
        .pipe(merge('merged.java', {
            publicMain: true
        }))
        .pipe(gulp.dest('output/')); 
});
```

## Usage
merge(fileName, options)

- `fileName`: The name of the generated file.
- `options`
  - `publicMain` (default: `false`): Make all classes containing a `public static void main` method public.
  - `removePackage` (default: `false`): Remove the package line on-top of the file.

## A few things
- Only works for a single package (i.e. you can't merge two packages into one bundled file).
- Assumes all files have only one class/enum/interface in it (not counting inner classes).

Note that this is not meant for production code. It's originally made to merge Java bot code in [CodinGame](https://www.codingame.com/) contests.
