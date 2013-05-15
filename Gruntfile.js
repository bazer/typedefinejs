module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      // gruntfile: {
      //   files: 'Gruntfile.js',
      //   tasks: ['jshint:gruntfile'],
      // },
      src: {
        files: ['src/*.ts'],
        tasks: ['default'],
      },
      // test: {
      //   files: '<%= jshint.test.src %>',
      //   tasks: ['jshint:test', 'qunit'],
      // },
    },
    typescript: {
      base: {
        src: ['src/**/*.ts'],
        dest: 'build/<%= pkg.name %>.js',
        options: {
          module: 'commonjs', //or commonjs
          target: 'es5', //or es3
          base_path: 'src',
          sourcemap: true,
          fullSourceMapPath: true,
          declaration: true,
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['typescript', 'uglify']);

};