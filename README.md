###Builder/Optimizer for AMD/CMD Loader

极速的AMD/CMD优化构建工具，支持requirejs/seajs/<a href="https://github.com/yessky/loader">k.js</a>等loader定义的AMD/CMD风格的模块.

####特点

1. 资源依赖分析

2. 资源transform

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

####demo

<a href="https://github.com/yessky/spa-sample-project">详情在这里</a>


####License

NOTE: 使用请保留版权信息

`kspack` is available under the terms of the <a href="https://github.com/yessky/kspack/blob/master/LICENSE.md">MIT License.</a>
