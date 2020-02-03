
install:install-deps db-setup

run:
	npx babel-node 'src/main.js'

install-deps:
	npm install

db-setup:
	npx sequelize db:migrate
	npx sequelize-cli db:seed:all

db-clear:
	npx sequelize-cli db:seed:undo
	npx sequelize-cli db:migrate:undo

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish
