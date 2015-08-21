
!function(kjs, util) {
	var fs = require('fs');
	var path = require('path');

	function isCjs(name) {
		return name === "require" || name === "exports" || name === "module";
	}

	function cache_mid(profile, src, base, normalized) {
		if (!profile.$mids[src]) {
			// 转化\ 
			var mid = normalized ? normalized : util.bslash( path.relative(base, src) );
			// 去除后缀.js
			profile.$mids[src] = util.extjs( mid, 1 );
		}
		return profile.$mids[src];
	}

	function cache_prid(profile, src, base, pid, prid) {
		if (!profile.$mids[src]) {
			profile.$mids[src] = pid + "!" + prid;
		}
		return profile.$mids[src];
	}

	// 遍历文件分提取依赖
	function walker( src, profile ) {
		// 跳过已被忽略文件 或者 cjs模块
		if ( profile.$miss[src] || isCjs(src) ) { return; }
		// 如果文件不存在且没有依赖项，标记为文件丢失
		if ( !fs.existsSync(src) ) {
			return profile.$miss[src] = 1;
		}
		var jsm = fs.readFileSync( src, 'utf8' );
		var dir = path.dirname(src);
		var base = profile.base;
		var deps = util.scan( jsm );
		var tree = profile.$tree;
		var ctree = tree[src] || (tree[src] = {});
		var dyns = profile.$dyns;
		var fixup = function(url, addSuffix) {
			var ret = path.resolve( url.charAt(0) === '.' ? dir : base, url );
			if (addSuffix) {
				ret = util.extjs( ret );
			}
			return util.bslash( ret );
		};
		// cache mid
		cache_mid(profile, src, base);
		// loop deps
		deps.forEach(function(dep, i) {
			if (!isCjs(dep)) {
				var da = dep.split('!');
				var dn = da[1] ? da[1] : da[0];
				var pn = da[1] ? da[0] : 0;
				var tid, subn, rn;

				// resove resource
				if (pn) {
					pn = fixup(pn, true);
					var pid = cache_mid(profile, pn, base);
					var res = rn = fixup(dn);

					// 解决资源路径
					var plugfix = profile.plugins && profile.plugins[pid];

					if (plugfix && plugfix.resolve) {
						var ret = plugfix.resolve(dn, fixup, kjs, profile);
						if (!ret) {
							tid = pn;
							rn = "";
						} else if (plugfix.pack) {
							tid = pn + "!" + ret;
							rn = ret;
						} else {
							tid = pn + "!" + rn;
						}
					} else {
						tid = pn + "!" + rn;
					}

					// 打包插件资源
					if (plugfix && plugfix.pack && rn && !plugfix.inline) {
						subn = rn;
					} else if ((!plugfix || !plugfix.pack) && rn) {
						dyns[tid] = res;
					}

					deps[i] = tid;

					if (rn) {
						var prid = dyns[tid] ? dn : util.bslash( path.relative(base, rn) );
						cache_prid(profile, tid, base, pid, prid);
					}
				} else {
					deps[i] = tid = fixup(dn, true);
				}
				// check if we need to walk down
				if ( tid in tree ) {
					if ( !(tid in ctree) ) {
						ctree[tid] = tree[tid];
					}
				} else {
					tree[tid] = {};
					ctree[tid] = tree[tid];
					if ( pn ) {
						if ( pn in tree ) {
							ctree[tid][pn] = tree[pn];
						} else {
							tree[pn] = {};
							ctree[tid][pn] = tree[pn];
							walker( pn, profile );
						}
						if (subn) {
							walker( subn, profile );
						}
					} else {
						walker( tid, profile );
					}
				}
			} else {
				ctree[dep] = tree[dep];
				cache_mid(profile, dep, base, dep);
			}
		});
		profile.$deps[src] = deps;
	}

	// process dependencies tree
	function process( profile ) {
		var deep = 0;
		var mods = {};
		var base = profile.base;
		var main = profile.main;
		var tree = profile.$tree;
		var priors = {};
		var mids = profile.$mids;

		var pends = {};
		var stack = [];
		// compute priorities
		expand( main, deep );
		profile.$mods = mods;

		// stats priority
		for ( var mid in mods ) {
			var di = mods[mid];
			// stats mods of each prior
			if ( !priors[di] ) {
				priors[di] = [];
			}
			priors[di].push( mid );
		}

		mids[main] = path.relative( base, main );
		mids[main] = util.bslash( util.extjs( mids[main], 1 ) );

		profile.$priors = priors;

		// build output
		Object.keys( priors ).sort(function(a, b) {
			return Number(a) > Number(b) ? -1 : 1;
		}).forEach(function( di ) {
			priors[di].forEach(function( p ) {
				if (!isCjs(p) && !profile.$dyns[p]) {
					profile.process( p, kjs.transform( p, profile ), profile );
				}
			});
		});

		function expand( src, deep ) {
			var dtree = tree[src];
			if (!dtree) { return; }
			deep += 1;
			stack.push(src);
			if (pends[src]) {
				return util.writeSync("./xxx.js", stack.join("\n"));
			}
			pends[src] = 1;
			for ( var p in dtree ) {
				//console.log(p);
				if ( !(p in mods) || mods[p] < deep ) {
					mods[p] = deep;
					expand( p, deep );
				}
			}
		}
	}

	// scan dependency tree and compute priority of dependencies
	kjs.walker = function( profile ) {
		var tree = profile.$tree = {};
		profile.$deps = {};
		profile.$miss = {};
		// url-mid 2 mid mapping
		profile.$mids = {};
		// dynamic-path mapping
		profile.$dyns = {};
		tree["require"] = {};
		tree["exports"] = {};
		tree["module"] = {};
		walker( profile.main, profile );
		process( profile );
		return profile;
	};

}(kjs, kjs.util);