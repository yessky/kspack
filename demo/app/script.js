;!function(global) {
	var test = function() {
		alert("xxxxx");
	};
	if (typeof define !== "undefined") {
		define(function() {
			return test;
		});
	} else {
		global.test = test;
	}
}(window);