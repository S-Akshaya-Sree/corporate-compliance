# Corporate Compliance Training Portal (Azure)

Static frontend + Azure Functions API + Cosmos DB, hosted on **Azure Static Web Apps**.

```
index.html                 frontend (login, dashboard, training, quiz, certificate, admin)
api/                       Azure Functions (Node 20, v4 programming model)
  src/functions/api.js     login, me, startModule, quiz (GET/POST), certificate, adminSummary
  src/lib/                 db.js (Cosmos), auth.js (JWT), catalog.js (modules + answer key)
scripts/seed.js            creates DB/containers + demo employees
staticwebapp.config.json   routing + security headers
```

## 1. Try it without Azure
Open `index.html`. With `API_BASE: null` it runs on built-in demo data.
Log in with any ID like `EMP-45102` and any password of 4+ characters.

## 2. Create the Azure resources
```bash
RG=compliance-rg; LOC=centralindia; COSMOS=cctp-cosmos-$RANDOM; SWA=cctp-portal

az group create -n $RG -l $LOC
az cosmosdb create -n $COSMOS -g $RG --kind GlobalDocumentDB --capabilities EnableServerless
az staticwebapp create -n $SWA -g $RG -l eastasia --sku Standard \
   --source https://github.com/<you>/<repo> --branch main \
   --app-location "/" --api-location "api"        # adds the GitHub Actions workflow

CONN=$(az cosmosdb keys list -n $COSMOS -g $RG --type connection-strings \
        --query "connectionStrings[0].connectionString" -o tsv)
az staticwebapp appsettings set -n $SWA -g $RG --setting-names \
   COSMOS_CONNECTION_STRING="$CONN" COSMOS_DB=compliance JWT_SECRET="$(openssl rand -hex 32)"
```
Use the **Standard** SKU so app settings and Key Vault references are available to the API.

## 3. Seed the database
```bash
cd api && npm install
COSMOS_CONNECTION_STRING="$CONN" npm run seed
```
Demo login: `EMP-45102` / `ChangeMe!2026` (change it).

## 4. Point the frontend at the API
In `index.html` set `const CONFIG = { API_BASE: '/api' };`, commit, and push. GitHub Actions deploys both the site and the API.

## Run locally
```bash
npm i -g @azure/static-web-apps-cli azure-functions-core-tools@4
cp api/local.settings.sample.json api/local.settings.json   # fill in values
swa start . --api-location api
```

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/login` | employee ID + password, returns JWT |
| GET | `/api/me` | profile, modules + status, notifications |
| POST | `/api/modules/{id}/start` | mark module started |
| GET / POST | `/api/quiz/{moduleId}` | questions (no answers) / grade answers, issue certificate |
| GET | `/api/certificate/{moduleId}` | fetch certificate |
| GET | `/api/admin/summary` | completion table (admin role) |

## Before production
- The footer says "Protected by your organization's identity provider". For real SSO, replace `/api/login` with **Microsoft Entra ID** via Static Web Apps built-in auth; keep the rest as is.
- Move `JWT_SECRET` and the Cosmos key into **Key Vault** references, or use managed identity for Cosmos.
- Add login rate limiting / lockout (e.g. Azure Front Door WAF) and Application Insights.
- Store PDF resources in **Blob Storage** and add a `videoUrl` / `pdfUrl` to each module record.
- Tokens are held in memory by the frontend (lost on refresh); use SWA auth cookies when you move to Entra ID.
