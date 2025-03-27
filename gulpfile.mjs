import gulp from 'gulp';

// Task which would just create a copy of the current views directory in build directory
gulp.task('views', function () {
  return gulp
    .src('./src/**/*.ejs') // Include all EJS files from the `src` directory
    .pipe(gulp.dest('./build')); // Copy them to the `build` directory, preserving the structure
});

// The default task which runs at start of the gulpfile.js
gulp.task('default', gulp.series('views'), () => {
  console.log('Build completed.');
});
