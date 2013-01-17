build:
	@npm install -d
	@mkdir -p dist
	@cp staticfile.js dist/staticfile.js
	@cp staticfile.js dist/browserify.js
	@echo "module.exports = staticfile;" >> dist/browserify.js
	@./node_modules/.bin/uglifyjs staticfile.js -m -nc > dist/staticfile.min.js
	@echo -n "Development:         " && cat dist/staticfile.js | wc -c
	@echo -n "Development+gzipped: " && cat dist/staticfile.js | gzip -c -f | wc -c
	@echo -n "Production:          " && cat dist/staticfile.min.js | wc -c
	@echo -n "Production+gzipped:  " && cat dist/staticfile.min.js | gzip -c -f | wc -c
