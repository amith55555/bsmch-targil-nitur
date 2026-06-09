# Branch: `feat/add-backend-metrics`

## 🎯 The Task
The objective of this task is to instrument our Node.js backend with Prometheus metrics, integrate it into our observability stack, and verify the data flow. 

Specifically, this branch accomplishes the following:
1. Exposes a `/metrics` endpoint on the backend.
2. Enables automatic instrumentation for default system and HTTP metrics.
3. Implements a custom counter metric that increments by `1` every time the `/api/success` endpoint is hit.
4. Deploys a local Prometheus scraper to pull these metrics and forward them to our existing Mimir database under the `devops-sre` tenant.
5. Manually configures the Mimir datasource in the Grafana UI and verifies the metrics are successfully queryable.

---

## 🛠️ Tools & Packages Used
* **`prom-client` (npm package):** The official Prometheus client for Node.js. This is the sole external dependency added to the backend to generate, format, and serve the metrics.
* **Vanilla Node.js (`http` module):** The backend relies entirely on Node's native `http` module to serve the API and metrics endpoints, keeping the container lightweight.
* **Docker:** Used to rebuild the backend container with the new dependencies and to run the standalone scraper.
* **Prometheus:** Configured as a lightweight agent to scrape the backend and use `remote_write` to push data.
* **Grafana & Mimir:** Used as the storage backend and visualization layer for the scraped metrics.

---

## ✅ What We Did (Step-by-Step Solution)

### Step 1: Instrumenting the Node.js Backend
1. **Initialize NPM:** Navigated into the `/backend-app` directory and ran `npm init -y` to create a `package.json`.
2. **Install Client:** Ran `npm install prom-client` to add the Prometheus library.
3. **Update Code:** Modified `server.js` to include the metrics logic:
   * **Auto Metrics:** Imported `prom-client` and executed `promClient.collectDefaultMetrics()` to automatically track CPU, memory, and event loop lag.
   * **Custom Counter:** Instantiated a new `promClient.Counter` named `backend_success_requests_total`.
   * **Increment Logic:** Added `successCounter.inc()` inside the `/api/success` route handler.
   * **Expose Endpoint:** Added a route handler for `GET /metrics` that responds with `promClient.register.metrics()`.

### Step 2: Updating Docker & Git Configurations
1. **Update Dockerfile:** Modified the `/backend-app/Dockerfile` to copy `package.json` and run `npm install` *before* copying the server code, ensuring dependencies are built into the image.
2. **Add Gitignore:** Created a `.gitignore` inside `/backend-app` specifically to ignore `node_modules/` and log files, keeping the Git history clean.

### Step 3: Setting Up the Prometheus Scraper
1. **Create Directory:** Created a new `/prometheus` directory at the project root.
2. **Configure Scraper:** Created `prometheus.yml` to define the scraping rules:
   * Set a `scrape_interval` of 15 seconds.
   * Set the target to `host.docker.internal:3040` to reach the standalone backend container.
   * Configured `remote_write` to push data to Mimir at `http://host.docker.internal:9009/api/v1/push`.
   * Injected the `X-Scope-OrgID: devops-sre` HTTP header to route the data into our specific Mimir tenant.
3. **Deploy Scraper:** Created a `docker-compose.yml` in the `/prometheus` folder and ran `docker-compose up -d` to start the agent.

### Step 4: Configuring the Datasource in Grafana UI
With data flowing into Mimir, we configured Grafana to read it:
1. Navigated to the Grafana UI at `http://localhost:3001`.
2. Went to **Connections > Data sources** and clicked **Add data source**.
3. Selected **Prometheus** and configured the following fields:
   * **Name:** Changed to `Mimir`.
   * **URL:** Set to `http://mimir:9009/prometheus` (utilizing the internal Docker bridge network).
   * **Custom HTTP Headers:** Added a new header with Key: `X-Scope-OrgID` and Value: `devops-sre`.
   * **Prometheus type:** Selected `Mimir` from the dropdown to unlock native backend features.
4. Clicked **Save & test** to confirm the connection was successful.

### Step 5: Verifying the Metrics
To ensure the entire pipeline works end-to-end:
1. **Generate Data:** Opened the React frontend (`http://localhost:5173`) and clicked the "Success Button" several times.
2. **Verify Backend Endpoint:** Navigated to `http://localhost:3040/metrics` to visually confirm `backend_success_requests_total` was incrementing in the raw text output.
3. **Verify in Grafana:** * Opened Grafana and navigated to **Explore**.
   * Selected the **Mimir** data source.
   * Executed the PromQL query: `backend_success_requests_total`.
   * Confirmed the graph accurately displayed the total number of button clicks!