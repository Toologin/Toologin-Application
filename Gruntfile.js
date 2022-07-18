module.exports = (grunt) => {
  grunt.initConfig({
    crx: {
      mySignedExtension: {
        src: 'extensions/Toologin/**/*',
        dest: 'extensions/Toologin.crx',
        options: {
          privateKey: 'extensions/private-key.pem',
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-crx');
  grunt.registerTask('default', ['crx']);
};
