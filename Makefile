build:
	browserify lib/map.js index.js -b mapping -o bundle.js
watch:
	watchify lib/map.js index.js -b mapping -o bundle.js
