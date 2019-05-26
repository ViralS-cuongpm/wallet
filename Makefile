all:
	git submodule update --init
	make reinstall
	make rebuild

rebuild:
	rm -rf dist/bin dist/libs && tsc
	make deps

build:
	tsc
	make deps

dep:
	cp -f $(t)/package.json dist/$(t)/
	cd dist/$(t) && rm -f package-lock.json && npm i

deps:
	make dep t=libs/sota-common
	make dep t=libs/wallet-core
	make dep t=libs/sota-btc
	make dep t=bin
	make dep t=bin/typeorm_migration
	make dep t=bin/eos

ts-dep-reinstall:
	cd $(t) && rm -rf node_modules package-lock.json && npm i

ts-dep-install:
	cd $(t) && rm -rf package-lock.json && npm i

ts-deps:
	make ts-dep-install t=./
	make ts-dep-install t=libs/sota-common
	make ts-dep-install t=libs/wallet-core
	make ts-dep-install t=libs/sota-btc
	make ts-dep-install t=bin
	make ts-dep-install t=bin/typeorm_migration
	make ts-dep-install t=bin/eos

ts-deps-reinstall:
	make ts-dep-reinstall t=./
	make ts-dep-reinstall t=libs/sota-common
	make ts-dep-reinstall t=libs/wallet-core
	make ts-dep-reinstall t=libs/sota-btc
	make ts-dep-reinstall t=bin
	make ts-dep-reinstall t=bin/typeorm_migration
	make ts-dep-reinstall t=bin/eos

install:
	make ts-deps

reinstall:
	make ts-deps-reinstall

migrations:
	cd bin/typeorm_migration && npm run migrations

deploy-207:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--filter=":- .gitignore" \
				. sotatek@192.168.1.207:/home/sotatek/s-wallet-btc

deploy-210:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--filter=":- .gitignore" \
				. sotatek@192.168.1.210:/home/sotatek/s-wallet-btc

deploy-204:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--filter=":- .gitignore" \
				. stt@192.168.1.204:/home/stt/s-wallet-btc

deploy-207-full:
	make deploy-207
	ssh sotatek@192.168.1.207 "cd s-wallet-btc && make reinstall && make rebuild && cd dist && pm2 start app.json"

deploy-207-lite:
	make deploy-207
	ssh sotatek@192.168.1.207 "cd s-wallet-btc && make install && make build && cd dist && pm2 start app.json"

deploy-204-lite:
	make deploy-204
	ssh stt@192.168.1.204 "cd s-wallet-btc && make install && make build && cd dist && pm2 start app.json"

