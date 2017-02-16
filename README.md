###Builder/Optimizer for AMD/CMD Loader

极速的AMD/CMD优化构建工具，支持requirejs/seajs/<a href="https://github.com/yessky/loader">k.js</a>等loader定义的AMD/CMD风格的模块.

####特点

1. 资源依赖分析

2. 资源transform(如，将html模版转化为js存储)

3. 多入口资源打包

4. 按需资源打包

5. 公用资源提取服务

6. 文件添加md5指纹

7. 使用简单的js配置文件进行打包配置

8. 打包后自动生成模块资源map配置信息，可配合传统php、jsp及spa项目

9. 使用node执行打包，速度超快

####用法

1. 复制kspack.js到你的项目中

2. 复制 `kspack.profile.js` 并按照你的项目修改，生成kspack打包所需的配置文件profile

3. 定义gulp任务

	```
		var KSPACK = require("./kspack");
		var ksprofile = require("./kspack.profile");

		gulp.task("kspack", function(cb) {
			var packer = new KSPACK(ksprofile);
			packer.on("complete", function(buildInfo) {
				// 这里根据自己的使用场景，自行添加后续处理逻辑，比如写入配置文件到html文件中
				cb();
			});
			packer.build();
		});
	```

####kspack.profile.js配置选项说明

	```
		module.exports = {
			appBase: __dirname,
			output: {
				// 打包时扫面依赖的起始路径
				baseUrl: config.baseUrl,
				// 打包文件输出的目录
				path: __dirname + config.paths.dist,
				// 是否压缩js文件
				compress: true,
				// 打包后的文件如何命名
				// 其中 	[name]: 文件的原始名字
				// 			[hash:8]:	文件md5指纹（8代表取指纹前8位）
				//			[ext]		文件的原始后缀
				filename: "[name].[hash:8][ext]"
			},
			// 打包时是否在控制台打印详细日志
			log: true,
			// 项目的入口文件
			entry: {
				"app/entry.Home": "app/entry.Home",
				"app/entry.About": "app/entry.About"
			},
			// 打包三方模块及提取项目公用资源
			chunk: [
				{name: "app/vendor", type: "concat", assets: ["underscore", "jquery"]},
				{name: "app/common", type: "common"}
			],
			// cmd 模块资源映射等配置
			modular: {
				// loader url
				loader: "base/k.js",
				// loader base url
				baseUrl: ".temp/",
				// 配置别名，打包时将根据此配置映射到真正的路径查找文件
				paths: {
					jquery: "vendor/zepto",
					underscore: "vendor/underscore"
				},
				// 配置非cmd模块的三方js库，打包时按照以下配置查找第三方非规范的js模块
				shim: {
					jquery: {
			      exports: '$'
			    },
			    flexible: {
			    	exports: 'lib'
			    },
			    zepto: {
			    	exports: "Zepto"
			    },
			    k: {
			    	exports: "require"
			    }
				},
				// 配置打包时插件如何加载本地文件
				plugins: {
					"base/text": {
						// normalize: function() {},
						test: /\.(html|tpl|txt|css)$/, // 只打包匹配此模式的文件，其他资源可能是线上按需加载
						load: function(mid, req, cb) {
							return req.injectUrl(req.toUrl(mid), cb);
						}
					},
					// url插件只负责计算资源相对于baseUrl的路径
					"base/url": {
						test: /\.(jpg|gif|png|jpeg|svg|ico|webp)$/,
						copyonly: true, // 告诉打包工具只扫描，不写入文件
						load: function(mid, req, cb) {
							return cb(req.toUrl(mid));
						}
					}
				}
			},
			// 优化所有未打包资源(可能是异步按需加载的资源)
			// 某些资源需异步按需加载，如require(expr)，打包工具无法扫描这些依赖，因此需要手动配置，将这些资源单独打包
			// 线上按需异步下载资源，这样使得资源加载数量和大小达到最优比例，加载速度最快
			// 这些资源可能是任意格式，故可将项目中所有的资源类型枚举出来
			// 资源路径支持模式匹配，参考node-glob用法
			async: [
				"base/**/*.js",
				"ui/**/*.{js,html,css}",
				"vendor/**/*.js",
				"app/**/*.{js,html,css}",
				"images/**/*.{png,svg}"
			]
		};
	```

	<a href="https://github.com/yessky/spa-sample-project">详情在这里</a>


####License

NOTE: 使用请保留版权信息

`kspack` is available under the terms of the <a href="https://github.com/yessky/kspack/blob/master/LICENSE.md">MIT License.</a>
