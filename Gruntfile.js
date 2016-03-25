module.exports = function(grunt) {
  
  grunt.initConfig({
    concat: {
      js: {
        src: ['bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'bower_components/d3/d3.js',
              'assets/js/app.js'],
        dest: 'build/js/scripts.js',
      },
      css: {
        src: ['bower_components/bootstrap/dist/css/bootstrap.css',
              'bower_components/font-awesome/css/font-awesome.min.css',
              'assets/css/app.css'],
        dest: 'build/css/style.css',
      },
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'bower_components/font-awesome/fonts/', src: ['*'], dest: 'build/fonts/'},
        ],
      },
    },
    jshint: {
      app: ['assets/js/app.js']
    },
    watch: {
      js: {
        files: ['assets/js/*.js', 'assets/css/*.css'],
        tasks: ['jshint:app', 'concat'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['concat', 'copy', 'watch']);

};