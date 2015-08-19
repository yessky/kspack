
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/text.js, mid: text
define("text",[],function() {
	return "text plugin";
});
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/m2.js2, mid: text!m2.js2
define("text!m2.js2",["text"],"define(function(require) {\n\tconsole.log(\"m2.js\nnext line\");\n});");
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/css.js, mid: css
define("css",[],function() {
	return "css plugin";
});
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/html.js, mid: html
define("html",[],function() {
	return "html plugin";
});
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/m2.js, mid: m2
// m2.js comment start
define("m2",[],function(require) {
	console.log("m2.js\nnext line");
});

// m2.js comment end
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/m2.js, mid: text!m2.js
define("text!m2.js",["text"],"// m2.js comment start\ndefine(function(require) {\n\tconsole.log(\"m2.js\nnext line\");\n});\n\n// m2.js comment end");
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/script.js, mid: script
;!function(global) {
	var test = function() {
		alert("xxxxx");
	};
	if (typeof define !== "undefined") {
		define("script",[],function() {
			return test;
		});
	} else {
		global.test = test;
	}
}(window);
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/m3.js, mid: m3
// m3.js comment start
define("m3",["text!m2.js2"],function(require) {
	console.log("m3.js\nnext line");
	console.log(require("./text!./m2.js2"));
});

// m3.js comment end
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/x1.css, mid: css!x1.css
define("css!x1.css",["css"],"html,body{padding:0;margin:0}.test{color:red}");
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/x1.html, mid: html!x1.html
define("html!x1.html",["html"],"<header>header content</header><main id=\"\"><div>row-1</div><div>row-2</div></main><footer id=\"abc\">footer content</footer>");
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/text.js, mid: text!text.js
define("text!text.js",["text"],"define(function() {\n\treturn \"text plugin\";\n});");
//>>>filename: /Users/aaron/Develop/builder-for-loader/demo/app/m1.js, mid: m1
/*m1.js comment start*/
define("m1",["require","m2","module","text!m2.js","script","m3","css!x1.css","html!x1.html","text!text.js"],function(require) {
	console.log(require("./m2"), require("./text!./m2.js"), require("./text!./text.js"));
});


/*m1.js comment end*/

/*m1.js comment end2*/



