module.exports = function(grunt) {
  
  grunt.initConfig({
    jshint: {
      app: ['assets/js/app.js']
    },
    watch: {
      js: {
        files: ['assets/js/*.js'],
        tasks: ['jshint:app'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['watch']);

};