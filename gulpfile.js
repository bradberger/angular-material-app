/* eslint-env node */
var gulp = require("gulp");
var eslint = require("gulp-eslint");
var protractor = require("gulp-protractor").protractor;
var uglify = require("gulp-uglify");
var browserSync = require("browser-sync").create();
var karma = require("karma").Server;
var extend = require("util")._extend;
var runSequence = require("run-sequence");
var scss = require("gulp-sass");
var minifyCSS = require("gulp-minify-css");
var autoprefixer = require("gulp-autoprefixer");
var minifyHTML = require("gulp-minify-html");
var gfi = require("gulp-file-insert");
var changed = require("gulp-changed");
var del = require("del");

var base = function(path) {
    return __dirname + (path.charAt(0) === "/" ? "" : "/") + (path || "");
};

var pub = function(path) {
    return base("public" + (path.charAt(0) === "/" ? "" : "/") + (path || ""));
};

var browserSyncConfig = {
    reloadOnRestart: true,
    open: "local",
    online: false,
    server: { baseDir: "./public" }
};

gulp.task("html:build", function() {
    var DEST = pub("");
    gulp
        .src(base("app/**/*.html"))
        .pipe(changed(DEST))
        .pipe(minifyHTML({ empty: true, loose: true }))
        .pipe(gulp.dest(DEST));
});

gulp.task("styles:build", function() {
    return gulp
        .src(base("app/scss/*.scss"))
        .pipe(scss())
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest(pub("css")));
});

gulp.task("js:build", function() {
    return gulp
      .src(base("app/js/**/*.js"))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(uglify({ preserveComments: "some" }))
      .pipe(gfi({
          "/*! angular.min.js */": "node_modules/angular/angular.min.js",
          "/*! angular-aria.min.js */": "node_modules/angular-aria/angular-aria.min.js",
          "/*! angular-animate.min.js */": "node_modules/angular-animate/angular-animate.min.js",
          "/*! angular-route.min.js */": "node_modules/angular-route/angular-route.min.js",
          "/*! angular-cookies.min.js */": "node_modules/angular-cookies/angular-cookies.min.js",
          "/*! angular-sanitize.min.js */": "node_modules/angular-sanitize/angular-sanitize.min.js",
          "/*! angular-material.min.js */": "node_modules/angular-material/angular-material.min.js"
      }))
      .pipe(gulp.dest(pub("js")));
});

// Watch tasks.
gulp.task("watch:browser-sync", function() {
    var cfg = extend({}, browserSyncConfig);
    return browserSync.init(cfg);
});

gulp.task("watch:js", ["watch:lint", "js:build"]);

gulp.task("watch:karma", function(done) {
    new karma({
        configFile: base("/karma.conf.js")
    }, done).start();
});

gulp.task("fonts:build", ["fonts:build:roboto", "fonts:build:material-icons"]);

gulp.task("fonts:build:roboto", function() {
    return gulp.src(base("node_modules/roboto-fontface/fonts/*"))
        .pipe(gulp.dest(pub("fonts")));
});

gulp.task("fonts:build:material-icons", function() {
    return gulp
        .src([
            base("node_modules/material-design-icons/iconfont/*.woff"),
            base("node_modules/material-design-icons/iconfont/*.woff2"),
            base("node_modules/material-design-icons/iconfont/*.ttf"),
            base("node_modules/material-design-icons/iconfont/*.eot")
        ])
        .pipe(gulp.dest(pub("fonts")));
});

gulp.task("watch:lint", function() {
    return gulp
      .src(base("app/angular-material-calendar.js"))
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task("watch:test", ["watch:lint"]);
/// END watch tasks ///

// START ci tasks ///
gulp.task("browser-sync:ci", function() {
    var cfg = extend({}, browserSyncConfig);
    cfg.open = false;
    browserSync.init(cfg);
});

gulp.task("karma:ci", function(done) {
    return new karma({
        configFile: base("/karma.conf.js"),
        singleRun: true
    }, done).start();
});

gulp.task("lint:ci", function() {
    return gulp
      .src(base("app/js/**/*.js"))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
});

gulp.task("protractor:ci", ["browser-sync:ci"], function() {
    return gulp
      .src(["./e2e/*.spec.js"])
      .pipe(protractor({ configFile: base("protractor.conf.js") }))
      .on("error", function() {
          browserSync.exit();
          process.exit(1);
      })
      .on("end", function() {
          browserSync.exit();
          process.exit();
      });
});

gulp.task("test", function() {
    runSequence("lint:ci", "clean", "build", ["karma:ci", "protractor:ci"]);
});

gulp.task("build", ["js:build", "fonts:build", "styles:build", "html:build"]);

/// END ci tasks ///
gulp.task("clean", function() {
    return del([ pub("**/*") ]);
});

gulp.task("watch", function() {
    gulp.watch(base("app/**/js/**/*.js"), ["js:build"]);
    gulp.watch(base("app/**/scss/**/*.scss"), ["styles:build"]);
    gulp.watch(base("app/**/*.html"), ["html:build"]);
    gulp.watch(pub("**/*")).on("change", browserSync.reload);
});

gulp.task("default", function() {
    runSequence("clean", "build", ["watch:karma", "watch:browser-sync", "watch"]);
});
