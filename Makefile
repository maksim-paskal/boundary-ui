RELEASE_VERSION=9.1.4
RELEASE_COMMIT=$(shell git rev-parse --short HEAD )
S3_DESTINATION=self/get.paskal-dev.com/boundary-desktop

build:
	make clean
	yarn install
	cd ui/desktop; RELEASE_VERSION=$(RELEASE_VERSION) \
	RELEASE_COMMIT=$(RELEASE_COMMIT) \
	yarn build
buildLinux:
	cd ui/desktop; RELEASE_VERSION=$(RELEASE_VERSION) \
	RELEASE_COMMIT=$(RELEASE_COMMIT) \
	yarn build:desktop:debianOnMacOS
clean:
	rm -rf ui/desktop/electron-app/out
	rm -rf ui/desktop/electron-app/ember-dist
	rm -rf ui/desktop/dist
start:
	cd ui/desktop/electron-app; yarn start
publish:
	mc rm -r --force $(S3_DESTINATION) || true
	mc cp -r ui/desktop/electron-app/out/release/$(RELEASE_VERSION)/*.dmg $(S3_DESTINATION)
	mc cp -r ui/desktop/electron-app/out/release/$(RELEASE_VERSION)/*.deb $(S3_DESTINATION)

	mc ls $(S3_DESTINATION) --json | \
	jq -r '"<a href=https://get.paskal-dev.com/boundary-desktop/"+.key+"?$(RELEASE_COMMIT)>"+.key+"</a><br/>"' > \
	/tmp/boundary-desktop-index.html

	echo '<br/><address>https://github.com/maksim-paskal/boundary-ui/commit/$(RELEASE_COMMIT)</address>' >> /tmp/boundary-desktop-index.html

	mc cp /tmp/boundary-desktop-index.html $(S3_DESTINATION)/index.html
	rm -rf /tmp/boundary-desktop-index.html