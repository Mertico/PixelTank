var gulp = require('gulp'),                          // Сообственно Gulp JS
    browserSync = require('browser-sync').create(),  // Вебсервер - Browsersync
    reload = browserSync.reload,
    nodemon = require('gulp-nodemon'),
    bot = require( 'gulp-develop-server' ),
    plumber = require('gulp-plumber');               // Вывод ошибок

// Run server
gulp.task('server', function() {
  var serverStream = nodemon({
    nodemon: require('nodemon'),
    script: './server/server.js',
    watch: './server/',
  })
  .on('start', function() {
    //bot.restart();
    console.log('Start server!')
    reload();
  })
  .on('restart', function () {
    console.log('Server restarted!')
  })
  .on('crash', function() {
    console.error('Server has crashed!\n')
    serverStream.emit('restart', 3)  // restart the server in 3 seconds 
  })
})

// Run bots
gulp.task('bots', function() {
  bot.listen( { path: './bots/server.js' } );
})


// Run client
gulp.task('client', function() {
  gulp.src('./client/**/*').pipe(plumber())
    .pipe(reload({stream:true})); // даем команду на перезагрузку страницы
});

// Локальный сервер для разработки
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./client"
    },
    tunnel: false,
    host: 'localhost',
    port: 9080,
  });
});

// Запуск
gulp.task('watch', ['server','browser-sync', 'client', 'bots'], function() {
  gulp.watch('./client/**/*', function() {
    gulp.start('client');
  });
  gulp.watch('./bots/server.js', bot.restart);
});
