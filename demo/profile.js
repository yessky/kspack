module.exports = {
	main: './app/m1.js',
	base: './app/',
	kjs: './app/',
	release: './app-released',
	compress: true,
	maps: {

	},
	plugins: {
		"text": {
			inline: true,
			resolve: function(prid, resolve) {
				return resolve(prid);
				//return resolve(prid) + "?1234";
			},
			transform: function( mid, deps, cst, kjs, profile ) {
				return (cst.left || '') + 'define("' + (cst[0] || mid) + '",' + deps + "," + ('"' + kjs.util.escape(cst[2]) + '"') + ")" + (cst.right === undefined ? ';' : cst.right);
				return (cst.left || '') + 'define("' + (cst[0] || mid) + '",' + deps + "," + ('"' + kjs.util.escape(cst[2]) + '"') + ")" + (cst.right === undefined ? ';' : cst.right);
			}
		},
		"css": {
			inline: true,
			resolve: function(prid, resolve) {
				return resolve(prid);
			},
			transform: function( mid, deps, cst, kjs, profile ) {
				var code = kjs.util.minifycss(cst[2]);
				return (cst.left || '') + 'define("' + (cst[0] || mid) + '",' + deps + "," + ('"' + code + '"') + ")" + (cst.right === undefined ? ';' : cst.right);
			}
		},
		"html": {
			inline: true,
			resolve: function(prid, resolve) {
				return resolve(prid);
			},
			transform: function( mid, deps, cst, kjs, profile ) {
				var code = kjs.util.minifyhtml( cst[2] );
				code = kjs.util.escape(code);
				return (cst.left || '') + 'define("' + (cst[0] || mid) + '",' + deps + "," + ('"' + code + '"') + ")" + (cst.right === undefined ? ';' : cst.right);
			}
		}
	}
};