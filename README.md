###Builder/Optimizer for AMD Loader

为AMD量身打造的优化构建工具，支持标准AMD(requirejs)以及CMD(seajs)

####特点

1. 标准模块依赖扫描

2. 插件资源依赖分析、资源路径推导、资源转换(如将文本格式资源转换为AMD模块)

3. 支持模块自动打包为单一文件中，或者自定义规则配置拆分打包到多个文件中

4. 自动生成模块相关配置信息，保证线上线下工作一致

5. 可正确转换UMD模块，如果资源未包含AMD/CMD/UMD申明, 目前暂时需要手动转换

####用法

1. 创建一个构建的profile文件(返回一个包含配置信息接口的node模块)

2. 执行path/to/kbuilder profile=path/to/profile

####Profile配置

TODO