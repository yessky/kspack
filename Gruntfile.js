module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('./package.json'),
	dest: 'dist',

	clean: {
		dist: {
			src: ['<%=dest%>']
		}
	},

	concat: {
		builder: {
			src: [
				'src/intro.js',
				'src/util.js',
				'src/walker.js',
				'src/transform.js',
				'src/build.js',
				'src/outro.js'
			],
			dest: '<%=dest%>/kbuilder'
		},
		dist: {
			options: {
				banner: '#!/usr/bin/env node' + grunt.util.linefeed
			},
			src: [
				'src/uglify.js',
				'src/html-minifier.js',
				'src/sqwish.js',
				'<%=dest%>/kbuilder'
			],
			dest: '<%=dest%>/kbuilder'
		}
	},

	uglify: {
		options: grunt.file.readJSON('.uglifyrc'),
		builder: {
			options: {
				sourceMap: false
			},
			src: ['<%=dest%>/kbuilder'],
			dest: '<%=dest%>/kbuilder'
		}
	},

	copy: {
		builder: {
			src: "dist/kbuilder",
			dest: "demo/kbuilder"
		}
	}
});


// load default plugin tasks
for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key !== 'grunt' && key.indexOf('grunt') === 0) {
        grunt.loadNpmTasks(key);
    }
}

grunt.registerTask('default', ['clean:dist', 'concat:builder', 'uglify', 'concat:dist', 'copy']);

};