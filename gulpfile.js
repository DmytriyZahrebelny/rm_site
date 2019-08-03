const gulp = require('gulp');
const plumber = require("gulp-plumber");
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require("gulp-imagemin");
const del = require("del");
const server = require('browser-sync').create();
const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');
const pug = require("gulp-pug");

gulp.task('styles', function() {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(sass({ includePaths: require('node-normalize-scss').includePaths }))
		.pipe(concat('style.css'))
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(gulp.dest('./build/css'))
		.pipe(csso())
		.pipe(rename("style.min.css"))
		.pipe(gulp.dest("build/css"))
		.pipe(server.stream());
})

gulp.task("images", function() {
	return gulp.src("src/img/*.{png, jpg, svg}")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
		]))
		.pipe(gulp.dest("src/img"));
})

gulp.task('scripts', function () {
	return gulp.src('./src/js/index.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(rollup({}, 'iife'))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('build/js'));
});

gulp.task('pug', function () {
	return gulp.src('./src/pug/pages/*.pug')
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
		}))
		.pipe(gulp.dest('build'))
		.pipe(server.stream());
})

gulp.task("copy", function() {
	return gulp.src([
		"./src/img/**",
	])
	.pipe(gulp.dest("build/img/"));
});

gulp.task("clear", function() {
	return del("build");
});

gulp.task("refresh", function(done) {
	server.reload();
	done();
});

gulp.task("server", function () {
	server.init({
		server: "build/",
	});

	gulp.watch("./src/scss/**/*.scss", gulp.series("styles"));
	gulp.watch("./src/pug/pages/*.pug", gulp.series("pug", "refresh"));
	gulp.watch('./src/js/**/*.js', gulp.series("scripts", "refresh"));
});

gulp.task("build", gulp.series(
	"clear",
	"copy",
	"styles",
	"pug",
	"scripts",
))

gulp.task("start", gulp.series("build", "server"));