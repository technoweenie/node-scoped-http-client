build: js remove-coffee

clean:
	@git clean -xxdf
	@git reset --hard

test: coffee-dep
	@find test -name '*_test.coffee' | xargs -n 1 -t coffee

dev: coffee-dep js
	@coffee --watch --compile --bare -output src src/

publish: npm-dep clean git-tag build npm-publish

VERSION = $(shell coffee src/npm-version.coffee)
git-tag:
	git commit --allow-empty -a -m "release $(VERSION)"
	git tag v$(VERSION)
	git push origin master
	git push origin v$(VERSION)

npm-publish:
	npm publish

install: npm-dep build
	npm install

js: coffee-dep
	@coffee --compile --bare --output src src/

remove-coffee:
	@rm src/*.coffee

npm-dep:
	@test `which npm` || echo 'You need npm to do npm install... makes sense?'

coffee-dep:
	@test `which coffee` || echo 'You need to have CoffeeScript in your PATH.\nPlease install it using `brew install coffee-script` or `npm install coffee-script`.'

.PHONY: all
