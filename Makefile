build:
	browserify index.js -b mapping -o bundle.js
watch:
	watchify index.js -b mapping -o bundle.js
