module.exports = function(grunt) {

	'use strict';

	var config = {};

	//fake hwBootstrap object.
	var hwBootstrap = {
		loader: {
			config: function(obj){
				mixin(config, obj);
			}
		}
	}

	function mixin(destination, source){
		for(var i in source){
			if(typeof source[i] === 'object' && !Array.isArray(source[i])){
				if(typeof destination[i] !== 'object'){
					destination[i] = {};
				}
				mixin(destination[i], source[i]);
			}
			else{
				destination[i] = source[i];
			}
		}
		return destination;
	}

	function objectToAttributeValue(obj){
		var inner = function(obj){
			var attr = '';

			for(var i in obj){
				if(Array.isArray(obj[i])){
					attr += i + ':' + printArray(obj[i]);
				}
				else if(typeof obj[i] === 'object'){
					attr += i + ': {' + inner(obj[i]) + '},';
				}
				else{
					attr += i + ':' + escapeVal(obj[i]) + ',';
				}
			}

			return attr.replace(/,$/, '');
		};

		var printArray = function(arr){
			var str = '[';

			for(var i=0; i<arr.length; i++){
				str += escapeVal(arr[i]) + ',';
			}

			str = str.replace(/,$/, '');

			return str + ']';
		};

		var escapeVal = function(val){
			if(typeof val === 'string'){
				return "\\\'" + val + "\\\'";
			}
			return val;
		};

		return inner(obj);
	}

	function buildOptimised(options, done){
		var optimiser;

		if(typeof options.optimiser === 'string'){
			optimiser = require(options.optimiser);
		}
		else{
			//else assume that the actual optimiser module has been
			//passed in rather than just the reference to it.
			optimiser = options.optimiser;
		}

		optimiser(options, options.done.bind(null, done));
	}

	function buildUnOptimised(options, done){

		if(Array.isArray(options.config)){
			for(var i=0; i<options.config.length; i++){
				eval(grunt.file.read(options.base + '/' + options.config[i] + '.js'));
			}
		}
		else{
			config = options.config;
		}

		var webroot = options.webroot,
			src = webroot + '/' + options.bootstrapRef + '.js',
			insertRequire = options.insertRequire,
			src = 'src="' + src + '"',
			requireAttr = 'data-require="' + insertRequire.join(',') + '"',
			configAttr = 'data-config="' + objectToAttributeValue(config) + '"',
			contents = 'document.write(\'<scr\'+\'ipt ' + configAttr + ' ' + requireAttr + ' ' + src + '></scr\'+\'ipt>\');';

		grunt.file.write(options.out, contents, {
			encoding: 'utf8'
		});

		done();
	}

	grunt.registerMultiTask('optimise_bootstrap', 'Build HW Bootstrap JS files for dev or production', function() {
		var done = this.async(),
			options = this.options({

				//can be a reference or the actual module
				optimiser: '../templates/script/libs/hw-bootstrap/optimiser',

				webroot: '/script',
				bootstrapRef: 'libs/hw-bootstrap/hw/hw',
				build: true,

				//can be object or array of config files
				config: {},

				insertRequire: ['app/app'],
				out: 'script/default.js',
				base: 'templates/script',

				done: function(done, response){
					done();
				}
			}),
			cmdOpts = {};

		//mixin command line options
		for(var i in options){
			var cmdOpt = grunt.option(i);
			if(typeof cmdOpt !== 'undefined'){
				options[i] = cmdOpt;
			}
		}

		if(!Array.isArray(options.insertRequire)){
			options.insertRequire = [options.insertRequire];
		}

		if(options.build){
			buildOptimised(options, done);
		}
		else{
			buildUnOptimised(options, done);
		}
	});
};
