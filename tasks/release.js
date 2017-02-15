module.exports = function(grunt){

	var pkg = require('../package'),
		types = ['live', 'uat', 'test'];

	grunt.registerTask('release', 'bumps live, uat or test version tag', function(type){

		if(!isValidType()){
			return grunt.fail.warn(
				'Invalid release type supplied. This task must be called like so ' +
				'"grunt release:type" where type must be one of the following: ' +
				'"' + types[0] + '", "' + types[1] + '", or "' + types[2] + '".'
			);
		}

		var done = this.async();

		getPreviousVersions(function(versions){

			versions[type]++;

			tag(versions[type], function(){
				createVersionFiles(versions);
				done();
			});
		});

		function isValidType(){
			for(var i=0; i<types.length; i++){
				if(types[i] === type){
					return true;
				}
			}
			return false;
		}

		function getPreviousVersions(callback){
			var versions = {};

			grunt.util.spawn({cmd: 'hg', args:['log', '-r', 'tagged()']}, function(err, result){
				if(err){
					return grunt.fail.warn(err);
				}

				result = result.toString();

				for(var i=0; i<types.length; i++){

					var type = types[i],
						regex = new RegExp('tag:[\\\s]*' + type + '-[\\\d]+', 'g'),
						match = result.match(regex),
						version = 0;

					if(match){
						match.forEach(function(tag){
							version = Math.max(version, parseInt(tag.replace(/[^\\\d]/g, ''), 10));
						});
					}

					versions[type] = version;
				}

				callback(versions);
			});
		}

		function tag(version, callback){
			grunt.util.spawn({ cmd: 'hg', args: [ 'tag', type + '-' + version ] }, function(err, result){
				if(err){
					return grunt.fail.warn(err);
				}

				grunt.log.ok('Bumped ' + type + ' tag to version ' + version);

				callback();
			});
		}

		function createVersionFiles(versions){
			if(pkg.templates.webroot){
				grunt.file.write(pkg.templates.webroot + '/version.json', JSON.stringify(versions, null, 4));
			}

			if(pkg.webApp.webroot){
				grunt.file.write(pkg.webApp.webroot + '/version.json', JSON.stringify(versions, null, 4));
			}

			pkg.releases = {};
			for(var i in versions){
				pkg.releases[i] = versions[i];
			}
			grunt.file.write('package.json', JSON.stringify(pkg, null, 4));
		}

	});

};