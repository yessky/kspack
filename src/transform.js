
!function(kjs, util) {
	var fs = require('fs');

	// transform cmd development to amd runtime
	function transform( filename, profile, formedCode ) {
		if (profile.$dyns[filename]) {
			return "";
		}
		var da = [];
		var mids = profile.$mids;
		var mid = mids[filename];
		var deps = profile.$tree[filename];
		var pluginResource = filename.indexOf('!') > 1;
		var src = pluginResource ? filename.split('!')[1] : filename;
		var slog = '\n//>>>filename: ' + src + ', mid: ' + mid + '\n';
		var code = formedCode ? formedCode : String( fs.readFileSync( src, 'utf8' ) );
		var cst = pluginResource ? [mid, 0, code] : util.parseDefine(code);
		var result = slog;
		for ( var p in deps ) {
			da.push( mids[p] );
		}
		deps = da.length ? '["' + da.join('","') + '"]' : '[]';
		var pluginProcessor = pluginResource && profile.plugins[ mids[filename.split("!")[0]] ];
		if (pluginProcessor && pluginProcessor.transform) {
			result += pluginProcessor.transform( mids, deps, cst, kjs, profile );
		} else {
			result += (cst.left || '') + 'define("' + (cst[0] || mid) + '",' + deps + "," + (pluginResource ? '"' + util.escape(cst[2]) + '"' : cst[2]) + ")" + (cst.right === undefined ? ';' : cst.right);
		}
		return result;
	}

	kjs.transform = transform;

}(kjs, kjs.util);