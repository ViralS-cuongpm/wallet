# s-wallet-btc
- Test update 1
- Test update 2
- Test update 3

### EZ Environment
- Requirements: NodeJS 8+
- MySQL 5.7+ or MariaDB 10+

- Pull code & update submodules
```
git pull && git submodule update --init --recursive
```

- Install dependencies
```
npm i -g typescript
make all
```

- Update environment variables
```
cd dist && cp .env.example .env
```

- Start app
```
cd dist && pm2 start app.json
```

### Other make commands

- Install all dependencies

```
make all
```

- Make a fresh build

```
make rebuild
```

- Make a build without removing existing node_modules

```
make build
```

- Run \*.ts files directly by ts-node

```
ts-node bin/BtcDepositWorker.ts
```

```
pm2 start app.json
```

- Run built scripts by node

```
cd dist && node bin/BtcDepositWorker.js
```

```
cd dist && pm2 start app.json
```

- Deploy code, perform a full build and start services on staging server:

```
make deploy-207-full
```

- Once a full deployment is done, we can just make a lite once from next time:

```
make deploy-207-lite
```
