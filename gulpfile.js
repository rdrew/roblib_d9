//@format
const yaml = require('js-yaml');
const fs = require('fs');
const { SITE, PORT, BSREWRITE, PATHS } = loadConfig();
//var server = require('browser-sync').create();
//global.server = server;
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const browsersync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

function loadConfig() {
  var ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// BrowserSync
function bsInit(done) {
  browsersync.init({
    logLevel: 'debug',
    proxy: 'https://roblib_2022.lndo.site'
  });
  done();
}

function bsInit__remote(done) {
  browsersync.init({
    proxy: SITE.Remote.Url,
    serveStatic: ['.'],
    files: PATHS.Watch,
    plugins: ['bs-rewrite-rules'],
    rewriteRules: [
      {
        match: BSREWRITE.Css.Match,
        replace: BSREWRITE.Css.Replace
      },
      {
        match: BSREWRITE.Js.Match,
        replace: BSREWRITE.Js.Replace
      }
    ]
  });
  done();
}

// BrowserSync Reload
function bsReload(done) {
  browsersync.reload();
  done();
}

var cp = require('child_process');
function drush() {
  return cp.exec('lando drush cr');
}

// Compile CSS
function styles() {
  'use strict';
  return gulp
    .src(PATHS.Scss.Dir + '/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass
        .sync({
          includePaths: PATHS.Scss.Libraries
        })
        .on('error', sass.logError)
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.Css.Dir))
    .pipe(browsersync.stream());
}

// Watch Files
function watchFiles() {
  'use strict';
  gulp.watch(PATHS.Scss.Dir + '/**/*.scss', styles);
  gulp.watch('./templates/**/*.twig', drush);
}

// Group complex tasks
const build = gulp.parallel(styles);
const watch = gulp.series(styles, gulp.parallel(watchFiles, bsInit));

// Export tasks
exports.build = build;
exports.styles = styles;
exports.drush = drush;
exports.watch = watch;
exports.default = watch;
