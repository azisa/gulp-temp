/**
 * Created by cycjimmy on 2016/7/13.
 */

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	useref = require('gulp-useref'),
	uglify = require('gulp-uglify'),
	gulpIf = require('gulp-if'),
	cssnano = require('gulp-cssnano'),
	svgstore = require('gulp-svgstore'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence'),
	ghPages = require('gulp-gh-pages');

/** Gulp task syntax
 * gulp.task('task-name', function () {
 * 	return gulp.src('source-files')          // Get source files with gulp.src
 * 		.pipe(aGulpPlugin())                 // Sends it through a gulp plugin
 * 		.pipe(gulp.dest('destination'))      // Outputs the file in the destination folder
 * })
 */

//CSS编译
gulp.task('sass', function() {
	return gulp
		.src('app/sass/**/*.scss')
		.pipe(sass())                      //编译sass
		.pipe(autoprefixer({
			browsers: ['last 2 versions'], //自动加前缀
			cascade: false
		}))
		.pipe(gulp.dest('app/style'))      //输出css
		.pipe(browserSync.reload({         //刷新web服务器
			stream: true
		}))
});

//svg图标合并
gulp.task('svgstore', function () {
	return gulp
		.src('app/icons/*.svg')
		.pipe(imagemin())                        //压缩svg
		.pipe(svgstore())                        //合并svg
		.pipe(gulp.dest('app/images/icons'));
});

//browserSync 自动刷新web服务器
gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: 'app'             //目录
		}
	})
});

//压缩合并
gulp.task('useref', function(){
	return gulp
		.src('app/*.html')
		.pipe(useref())                     //合并
		.pipe(gulpIf('*.js', uglify()))     //压缩JS
		.pipe(gulpIf('*.css', cssnano()))   //压缩CSS
		.pipe(gulp.dest('dist'));
});

//压缩图片
gulp.task('images', function(){
	return gulp
		.src(['app/images/**/*.+(png|jpg|gif|svg)', '!app/images/icons/**/*'])
		.pipe(imagemin())                    //压缩图片
		.pipe(gulp.dest('dist/images'))
});

//复制图标
gulp.task('copyIcon', function() {
	return gulp
		.src('app/images/icons/**/*')
		.pipe(gulp.dest('dist/images/icons'))
});

//清空目录
gulp.task('clean', function(callback) {
	del('dist');
	return cache.clearAll(callback);
});

//清空目录，不包含图片
gulp.task('clean:dist', function(callback){
	del(['dist/**/*', '!dist/images', '!dist/images/**/*']);
	return cache.clearAll(callback);
});


/** Gulp watch syntax
 * gulp.watch('files-to-watch', ['tasks', 'to', 'run']);
 */

//监听
gulp.task('watch', ['browserSync', 'sass'], function(){
	gulp.watch('app/sass/**/*.scss', ['sass']);                //监听scss文件变化
	gulp.watch('app/*.html', browserSync.reload);              //监听html文件变化
	gulp.watch('app/scripts/**/*.js', browserSync.reload);     //监听JS文件变化
});



/** runSequence syntax
 * gulp.task('task-name', function(callback) {
 *	  runSequence('task-one', 'task-two', 'task-three', callback);
 * });
 */



gulp.task('default', function (callback) {
	runSequence(['sass','browserSync', 'watch'],
		callback
	)
});


gulp.task('build', function (callback) {
	runSequence('clean:dist', 'sass',
		['useref', 'images', 'copyIcon'],
		callback
	)
});


//部署到ghPages
gulp.task('deploy', function() {
	return gulp.src('./dist/**/*')
		.pipe(ghPages());
});