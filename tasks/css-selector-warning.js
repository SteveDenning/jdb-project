module.exports = function(grunt){

	grunt.registerMultiTask('css_selector_warning', 'counts css selectors and shows warning if above IE limit', function(){

		var options = this.options({
				src: null,
				limit: 4095
			}),
			files = grunt.file.expand(options.src),
			file, match, innerMatch;

		for(var i=0; i<files.length; i++){
			count(files[i], grunt.file.read(files[i]));
		}

		function count(fileName, str){
			var count = 0;

			//remove all line breaks.
			str = str.replace(/(\r\n|\n|\r)/gm, '');

			//remove all comments.
			str = str.replace(/\/\*.*\*\//, '');

			match = str.match(/[^{]+{[^}]*}/g);

			if(match){
				for(var i=0; i<match.length; i++){
					innerMatch = match[i].split(',');
					count += innerMatch.length;

					if(count > options.limit){
						grunt.fail.warn(fileName + ' is over the css selector limit of ' + options.limit + '.\nThe first selector that is over the limit is "' + match[i] + '".');
						break;
					}
				}
			}
		}

	});

};