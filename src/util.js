
!function(kjs, global) {

	var util = kjs.util = {};
	var path = require("path");
	var fs = require("fs");
	var sqwish = global.sqwish;
	var minify = global.minify;

	function mixin( dest, src ) {
		for ( var p in src ) {
			dest[p] = src[p];
		}
		return dest;
	}

	// command line arguments parser
	util.args = function() {
		var args = process.argv;
		var result = {};
		var arg, key;
		for (var i = 0, l = args.length; i < l; ++i) {
			arg = args[i];
			if ( arg.substr(0,2) === '--' ) {
				key = arg.slice(2);
				if ( args[i + 1] ) {
					result[key] = ( args[i + 1].substr(0, 2) === '--' ) ? true : args[++i];
				} else {
					result[key] = true;
				}
			} else if ( arg.substr(0,1) === '-' ) {
				key = arg.slice(1);
				if ( args[i + 1] ) {
					result[key] = ( args[i + 1].substr(0, 1) === '-') ? true : args[++i];
				} else {
					result[key] = true;
				}
			} else if ( arg.indexOf('=') > 0 ) {
				arg = arg.match(/([^=]+)=(.*)/);
				result[arg[1]] = arg[2];
			}
		}
		return result;
	};

	// extract dependencies from given code
	util.scan = function( code ) {
		var ret = [];
		var uniq = {};
		var ast = UglifyJS.parse(code);
		var tw = new UglifyJS.TreeWalker(function(node, decend) {
			if ( node instanceof UglifyJS.AST_Call ) {
				if ( node.expression.name === 'define' && node.args ) {
					var argsLen = node.args.length;
					var dindex = argsLen === 2 ? 0 : 1;
					if ( argsLen > 1 && node.args[dindex].elements && node.args[dindex].elements.length ) {
						node.args[dindex].elements.forEach(function(elem) {
							if (!uniq[elem.value]) {
								uniq[elem.value] = 1;
								ret.push( elem.value );
							}
						});
					}
				} else if ( node.expression.name === 'require' && node.args && node.args[0].start.type === 'string' ) {
					if (!uniq[node.args[0].value]) {
						uniq[node.args[0].value] = 1;
						ret.push( node.args[0].value );
					}
				}
			}
		});

		ast.walk(tw);

		return ret;
	};

	util.scanMain = function( code ) {
		var ret = {};
		var ast = UglifyJS.parse(code);
		var tw = new UglifyJS.TreeWalker(function(node, decend) {
			if ( node instanceof UglifyJS.AST_Call && node.start.value === 'require' && node.expression.property === 'config' ) {
				ret.config = code.substring( node.start.pos, node.end.endpos + 1 );
				ret.output = code.substring( 0, node.start.pos ) + code.substring( node.end.endpos + 1 );
			}
		});

		ast.walk(tw);

		return ret;
	};

	util.parseDefine = function( code ) {
		var ret = ['', '', ''];
		var ast = UglifyJS.parse(code);
		var done = 0;
		var sep = function(node) {
			return code.substring(node.start.pos, node.end.endpos);
		};
		var tw = new UglifyJS.TreeWalker(function(node, decend) {
			if ( !done && node instanceof UglifyJS.AST_Call && node.expression.name === 'define' ) {
				var argsLen = node.args.length;
				done = 1;
				if (argsLen === 1) {
					ret[2] = sep(node.args[0]);
				} else if (argsLen === 2) {
					ret[2] = sep(node.args[1]);
					ret[1] = sep(node.args[0]);
				} else if (argsLen >= 3) {
					ret[0] = sep(node.args[0]);
					ret[1] = sep(node.args[1]);
					ret[2] = sep(node.args[2]);
				}
				ret.left = code.substring(0, node.start.pos);
				ret.right = code.substring(node.end.endpos);
				return done;
			}
		});

		ast.walk(tw);

		return ret;
	};

	var uglify_compress = {
		// 连续单语句，逗号分开
		// 如： alert(1);alert(2); => alert(1),alert(2)
		sequences: true,
		// 重写属性
		// 如：foo['bar'] => foo.bar
		properties: false,
		// 删除无意义代码
		dead_code: false,
		// 移除`debugger;`
		drop_debugger: true,
		// 删除console.*
		drop_console: true,
		// 使用以下不安全的压缩
		unsafe: false,
		//
		unsafe_comps: false,
		// 压缩if表达式
		conditionals: false,
		// 压缩条件表达式
		comparisons: false,
		// 压缩常数表达式
		evaluate: false,
		// 压缩布尔值
		booleans: true,
		// 压缩循环
		loops: false,
		// 移除未使用变量
		unused: true,
		// 函数声明提前
		hoist_funs: true,
		// 变量声明提前
		hoist_vars: true,
		// 压缩 if return if continue
		if_return: false,
		// 合并连续变量省略
		join_vars: true,
		// 小范围连续变量压缩
		cascade: false,
		// 不显示警告语句
		warnings: false,
		side_effects: true,
		pure_getters: true,
		pure_funcs: null,
		negate_iife: true,
		// 全局变量
		global_defs: {}
	};

	var uglify_mangle = {
			except: 'require,exports,module'
	};

	util.minifyjs = function(sjs, opts) {
		var ast = UglifyJS.parse(sjs);
		var copts = mixin( uglify_compress, opts && opts.compress || {} );
		var mopts = mixin( uglify_mangle, opts && opts.mangles || {} );
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor( copts );
    ast = ast.transform( compressor );
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names( mopts );
    sjs = ast.print_to_string();
    return sjs;
	};

	util.minifycss = function(scss, opts) {
		return sqwish.minify(scss, typeof opts === "undefined" ? true : opts);
	};

	util.minifyhtml = function(shtml, opts) {
		var sets = {
			removeComments: true,
			collapseWhitespace: true
		};
		return minify(shtml, mixin(sets, opts || {}));
	};

	util.mkdir = function(dir, mode) {
		if ( fs.existsSync(dir) ) { return; }

		if ( !mode ) {
			mode = parseInt('0777', 8) & ( ~process.umask() );
		}

		dir.split(path.sep).reduce(function( parts, part ) {
			parts += part + '/';
			var sub = path.resolve( parts );
			if ( !fs.existsSync(sub) ) {
				fs.mkdirSync( sub, mode );
			}
			return parts;
		}, '');
	};

	util.writeSync = function( filename, data ) {
		var dir = path.dirname( filename );
		util.mkdir( dir );
		fs.writeFileSync( filename, data, {encoding: 'utf8'} );
	};

	util.extjs = function( src, modular ) {
		if ( modular ) {
			src = src.replace(/\.js$/, '');
		} else if ( !(/\.js/.test(src)) ) {
			src += '.js';
		}
		return src;
	};

	util.dequote = function( txt ) {
		return txt.replace(/"/g, '\\"');
	};

	util.bslash = function( txt ) {
		return txt.replace(/\\/g, '/');
	};

	util.str2obj = function( str ) {
		return new Function( '', 'return ' + str )();
	};

	util.escape = function( txt ) {
		return util.dequote( txt ).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
	};

}(kjs, this);