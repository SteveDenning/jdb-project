//read this page to understand how this file works - http://gruntjs.com/getting-started

module.exports = function(grunt){

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({

		pkg: pkg,

		//https://npmjs.org/package/grunt-contrib-clean
		clean: [
			'<%= pkg.webApp.webroot %>/<%= pkg.webApp.css.path %>', 
			'<%= pkg.webApp.webroot %>/<%= pkg.webApp.js.path %>', 
			'<%= pkg.webApp.webroot %>/<%= pkg.webApp.img.path %>', 
			'<%= pkg.webApp.webroot %>/<%= pkg.webApp.fonts.path %>'
		],

		//https://npmjs.org/package/grunt-contrib-copy
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: '<%= pkg.templates.webroot %>/<%= pkg.templates.img.path %>',
						src: ['**'],
						dest: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.img.path %>/'
					},
					{
						expand: true,
						cwd: '<%= pkg.templates.webroot %>/<%= pkg.templates.fonts.path %>',
						src: ['**'],
						dest: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.fonts.path %>/'
					}
				]
			}
		},

		//https://npmjs.org/package/grunt-contrib-compass
		compass: {
			options: {
				sassDir: '<%= pkg.templates.css.source %>',
				cssDir: '<%= pkg.templates.webroot %>/<%= pkg.templates.css.path %>',
				imagesDir: '<%= pkg.templates.webroot %>/<%= pkg.templates.img.path%>',
				httpImagesPath: '<%= pkg.templates.webroot %>/<%= pkg.templates.img.httpPath %>',
				httpFontsPath: '<%= pkg.templates.webroot %>/<%= pkg.templates.fonts.httpPath %>',
				force: true,
				bundleExec: true
			},

		 	dist: { 
		 		options: {
		 			outputStyle: 'compressed'
		 		}
		 	},

		 	webAppDist: {
		 		options: {
		 			outputStyle: 'compressed',
		 			cssDir: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.css.path %>',
		 			httpImagesPath: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.img.httpPath %>',
		 			httpFontsPath: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.fonts.httpPath %>'
		 		}
		 	},

		 	dev: {
		 		options: {
		 			watch: true,
		 			outputStyle: 'expanded',
		 			debugInfo: true,
		 		}
		 	},

		 	webAppDev: {
		 		options: {
		 			outputStyle: 'expanded',
		 			debugInfo: true,
		 			cssDir: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.css.path %>',
		 			httpImagesPath: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.img.httpPath %>',
		 			httpFontsPath: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.fonts.httpPath %>'
		 		}
		 	}
		},

		//https://npmjs.org/package/grunt-htmlhint
		htmlhint: {
			options: {
				'tagname-lowercase': true,
				'attr-lowercase': true,
				'attr-value-double-quotes': true,
				'doctype-first': true,
				'tag-pair': true,
				'spec-char-escape': true,
				'id-unique': true,
				'src-not-empty': true,
				'img-alt-require': true,
				'doctype-html5': true,
				'style-disabled': true
			},
			target: {
				src: ['<%= pkg.templates.webroot %>/<%= pkg.templates.html.path %>/**/*.html']
			}
		},

		//https://npmjs.org/package/grunt-contrib-jshint
		jshint: {
			files: ['<%= pkg.templates.webroot %>/<%= pkg.templates.js.path %>/app/**/*.js']
		},

		//https://www.npmjs.org/package/grunt-mocha-require-phantom
	  	mocha_require_phantom: {
	  		options: {
	  			base: '<%= pkg.templates.webroot %>/<%= pkg.templates.js.path %>',
	  			main: 'tests/bootstrap',
	  			requireLib: 'libs/hw-bootstrap/hw/hw.js',
	  			files: ['tests/libs/**/*.js', /* add your app test files here */],
	  			//make sure the option below is commented out before committing!
	  			//keepAlive: true
	  		},
	  		target: {},
	  	},

		//local task
		css_selector_warning: {
			target: {
				options: {
					src: '<%= pkg.templates.webroot %>/<%= pkg.templates.css.path %>/**/*.css'
				}
			}
		},

		//local task
		// tags a release in HG. Run from the command line like so:
		// grunt release:live
		// grunt release:uat
		// grunt release:test
		// this task does *not* push the tag.
		release: {
			
		},

		//local task
		optimise_bootstrap: {
			options: {

				optimiser: './' + pkg.templates.webroot + '/' + pkg.templates.js.path + '/libs/hw-bootstrap/optimiser',

				out: '<%= pkg.templates.webroot %>/<%= pkg.templates.js.path %>/<%= pkg.templates.js.out %>.js',

				config: {
					baseUrl: '/script'
				}
			},

			dist: {
				options: {
					build: true
				}
			},

			dev: {
				options: {
					build: false
				}
			},

			webAppDist: {
				options: {
					build: true,
					out: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.js.path %>/<%= pkg.templates.js.out %>.js'
				}
			},

			webAppDev: {
				options: {
					build: true,
					optimise: 'none',
					out: '<%= pkg.webApp.webroot %>/<%= pkg.webApp.js.path %>/<%= pkg.templates.js.out %>.js'
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-htmlhint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-mocha-require-phantom');

	grunt.loadTasks('tasks');

	//default task - run this task before deploying
	grunt.registerTask('default', ['test', 'compass:dist', /*'optimise_bootstrap:dist',*/]);

	//dev task - run this task before and during development work
	grunt.registerTask('dev', [/*'optimise_bootstrap:dev',*/ 'compass:dev']);

	//webAppDev task - run this task to copy front-end assets to web app directory. This task
	//will compile CSS and JS but leave them uncompressed.
	grunt.registerTask('webAppDev', ['copy', 'compass:webAppDev', /*'optimise_bootstrap:webAppDev'*/]);

	//webAppDist task - run this task to copy front-end assets to web app directory. 
	//This task will compile and compress CSS and JS.
	grunt.registerTask('webAppDist', ['copy', 'compass:webAppDist', /*'optimise_bootstrap:webAppDist'*/]);

	//unit test task - add unit tests here.
	grunt.registerTask('unitTest', [/*'mocha_require_phantom'*/]);

	//test task - will get run as part of default task.
	grunt.registerTask('test', ['css_selector_warning', 'htmlhint', 'jshint', 'unitTest']);
};