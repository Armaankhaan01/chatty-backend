import gulp from 'gulp';
import ts from 'gulp-typescript';
const tsProject = ts.createProject('tsconfig.json');
import { deleteAsync } from 'del';

// Task which would delete the old build directory if present
gulp.task('build-clean', function () {
  return deleteAsync(['./build']);
});

// Task which would transpile typescript to javascript
gulp.task('typescript', function () {
  return tsProject
    .src() // Get all TypeScript files
    .pipe(tsProject()) // Process them through tsProject
    .js // Access the resulting JavaScript
    .pipe(gulp.dest('build')); // Output the JavaScript to the `build` directory
});

// Task which would just create a copy of the current views directory in build directory
gulp.task('views', function () {
  return gulp
    .src('./src/**/*.ejs') // Include all EJS files from the `src` directory
    .pipe(gulp.dest('./build')); // Copy them to the `build` directory, preserving the structure
});

// The default task which runs at start of the gulpfile.js
gulp.task('default', gulp.series('build-clean', 'typescript', 'views'), () => {
  console.log('Build completed.');
});
