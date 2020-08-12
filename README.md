# Self-hosted cache server for nx

## 1 How to run server
### 1.1 With Docker
1. `git clone https://github.com/aaa4xu/nx-self-hosted-cache.git`
4. `docker-compose up`

### 1.2 Without Docker
1. Install and configure [Minio](https://min.io/download#/windows)
2. `git clone https://github.com/aaa4xu/nx-self-hosted-cache.git`
3. `npm install`
4. Copy `default.env` to `.env`
5. Set `MINIO_ADDRESS` in `.env`
6. `yarn start` / `npm start`

## 2. How to configure workspace
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
