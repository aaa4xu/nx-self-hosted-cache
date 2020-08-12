# Self-hosted cache server for [nrwl/nx](https://nx.dev/)

## Quickstart
### 1. How to run server
#### 1.1 With docker-compose
```yaml
version: '3.5'

services:
  nx-cache:
    image: aaa4xu/nx-self-hosted-cache
    environment:
      MINIO_ADDRESS: http://accesskey:secretkey@host.docker.internal:9000 # "localhost" or "minio" is not valid address here!
    ports:
      - 8000:80

  minio:
    image: minio/minio:RELEASE.2020-08-08T04-50-06Z
    environment:
      MINIO_ACCESS_KEY: accesskey
      MINIO_SECRET_KEY: secretkey
    ports:
      - 9000:9000
    command: server /data
```

#### 1.2 With Docker
1. Install and configure [Minio](https://min.io/download)
2. `docker run -p 8000:80 \
      -e "MINIO_ADDRESS=http://accesskey:secretkey@minio.domain.com:9000" \
      aaa4xu/nx-self-hosted-cache`

#### 1.3 Without Docker
1. Install and configure [Minio](https://min.io/download)
2. `git clone https://github.com/aaa4xu/nx-self-hosted-cache.git`
3. `npm install`
4. Copy `default.env` to `.env`
5. Set `MINIO_ADDRESS` in `.env`
6. `yarn start` / `npm start`

### 2. How to configure workspace
1. Setup your workspace with [Nx Cloud guide](https://nx.app/orgs/workspace-setup).
2. Open `nx.json` and create `url` option for `@nrwl/nx-cloud` runner:
    ```json
    {
      "default": {
        "runner": "@nrwl/nx-cloud",
        "options": {
          "accessToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "cacheableOperations": [
            "build",
            "test",
            "lint",
            "e2e"
          ],
          "canTrackAnalytics": false,
          "showUsageWarnings": true,
          "url": "http://localhost:8000"
        }
      }
    }
    ```
3. `nx affected:build`
