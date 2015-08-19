
!function(kjs, util) {
	var fs = require('fs');
	var path = require('path');
	var startTime = Date.now();

	var args = util.args();
	var cwd = process.cwd() + path.sep;

	var profurl = args.profile;
	if (profurl.indexOf(':\\') > -1 || profurl.charAt(0) === '/') {
		profurl = path.resolve(profurl);
	} else {
		profurl = path.resolve(cwd + profurl);
	}

	if (!fs.existsSync(profurl)) {
		return console.error( 'exit as not found build profile !!!' );
	}

	//var profile = util.str2obj(fs.readFileSync(profurl, 'utf8'));
	var profile = require(profurl);
	var appmain = profile.main;
	var profdir = path.dirname(profurl);

	var mainurl = profile.main = path.resolve(profdir, appmain);
	var baseurl = profile.base = path.resolve(profdir, profile.base);
	var kjsurl = profile.kjs = path.resolve(profdir, profile.kjs);
	var releaseurl = path.resolve(profdir, profile.release);

	profile.$output = {};

	if (!profile.process) {
		profile.process = function(filename, formed, map) {
			var mid = profile.$mids[mainurl];
			if (!profile.$output[mid]) {
				profile.$output[mid] = '';
			}
			profile.$output[mid] += formed;
		};
	}

	var mcode = String(fs.readFileSync(mainurl, 'utf8'));
	var mdata = util.scanMain(mcode);
	var result = kjs.walker(profile);
	var mmid = result.$mids[mainurl];
	var opts = {encoding: 'utf8'};

	util.mkdir(releaseurl);

	if (args.debug) {
		util.writeSync(releaseurl + "/" + './build.log.js', JSON.stringify(result));
	}

	for (var mid in result.$output) {
		var output = result.$output[mid];
		if (mid === mmid) {
			output = (mdata.config ? mdata.config + '\n' : '') + output + kjs.transform(result.main, result, mdata.output);
		}
		util.writeSync(releaseurl + "/" + util.extjs(mid + ".uncompressed"), output);
		if (profile.compress) {
			util.writeSync(releaseurl + "/" + util.extjs(mid), util.minifyjs(output));
		}
	}

	// copy dynamic module
	for (var mid in result.$dyns) {
		var f = result.$dyns[mid];
		var rel = path.relative(result.base, f);
		var txt = fs.readFileSync(f) + "";
		util.writeSync(releaseurl + "/" + rel.replace(/(\.\w+)$/, ".uncompressed$1"), txt,util.minifyjs(txt));
		if (profile.compress) {
			util.writeSync(releaseurl + "/" + rel, util.minifyjs(txt));
		}
	}

	var endTime = Date.now();
	var timeCost = endTime - startTime;

	console.log('finished in ' + timeCost + ' ms.');

}(kjs, kjs.util);