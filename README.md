###Builder/Optimizer for AMD Loader

极速的AMD/CMD优化构建工具，支持requirejs/seajs/[https://github.com/yessky/loader][k.js]等AMD/CMD模块系统.

####特点

1. 集成了html/js/css文件的合并压缩等模块，无需npm安装各种依赖，极速进行构建部署

2. 插件资源依赖分析、资源路径推导、资源转换(如将文本格式资源转换为AMD模块)

3. 支持模块自动打包为单一文件中，或者自定义规则配置拆分打包到多个文件中

4. 自动生成模块相关配置信息

5. 支持UMD模块转换，暂时需要手动转换一般脚本文件

####用法

1. 创建一个构建的profile文件(返回一个包含配置信息接口的node模块)

2. 执行path/to/kbuilder profile=path/to/profile

####demo

[https://github.com/yessky/builder-demo-for-loader][详情在这里]
