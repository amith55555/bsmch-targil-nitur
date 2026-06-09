# Branch: `task/add-backend-metrics`

## 🎯 The Task
The objective of this task is to instrument our Node.js backend with Prometheus metrics and integrate it into our observability stack. 

Specifically, this branch accomplishes the following:
1. Exposes a `/metrics` endpoint on the backend.
2. Enables automatic instrumentation for default system and HTTP metrics.
3. Implements a custom counter metric that increments by `1` every time the `/api/success` endpoint is hit.
4. Deploys a local Prometheus scraper to pull these metrics and forward them to our existing Mimir time-series database under a specific tenant.

---

## 🛠️ Tools & Packages Used
* **`prom-client` (npm package):** The official Prometheus client for Node.js. This is the sole external dependency added to the backend to generate, format, and serve the metrics.
* **Vanilla Node.js (`http` module):** The backend relies entirely on Node's native `http` module to serve the API and metrics endpoints, keeping the container incredibly lightweight without needing frameworks like Express.
* **Docker:** Used to rebuild the backend container with the new dependencies and to run the standalone scraper.
* **Prometheus:** Configured as a lightweight agent to scrape the backend and use `remote_write` to push data.
* **Grafana & Mimir:** Used as the storage backend and visualization layer for the scraped metrics.

---

## ✅ What We Did (The Solution)

### 1. Backend Instrumentation
* Initialized a `package.json` in the `/backend-app` directory and installed the `prom-client` package.
* Updated `server.js` to include `promClient.collectDefaultMetrics()` for automatic system/HTTP instrumentation.
* Created a custom Prometheus Counter named `backend_success_requests_total`.
* Updated the `/api/success` route to increment this counter on every successful request.
* Exposed the `/metrics` route to serve the formatted data.

### 2. Docker & Git Updates
* Updated the backend `Dockerfile` to copy `package.json` and run `npm install` before executing the server.
* Added a robust `.gitignore` to the `/backend-app` directory to prevent committing `node_modules` and potential `.env` files.

### 3. Prometheus Scraper Setup
* Created a new `/prometheus` directory containing its own `docker-compose.yml`.
* Wrote a `prometheus.yml` configuration file that:
  * Scrapes the Node.js backend via `host.docker.internal:3040` every 15 seconds.
  * Uses `remote_write` to push data directly to the Mimir container (`host.docker.internal:9009/api/v1/push`).
  * Injects the `X-Scope-OrgID: devops-sre` HTTP header to properly route the data into our specific Mimir tenant.

### 4. Grafana Integration
* Configured Mimir as a Prometheus-type Data Source directly within the Grafana UI.
* Injected the custom `X-Scope-OrgID` header into the Data Source configuration to authenticate as the `devops-sre` tenant.
* Set the Prometheus version/type to "Mimir" to unlock native backend features.

---

## 🔍 Verification: Test Your Metrics!

To ensure everything was wired up correctly, follow these steps:

1. **Generate Traffic:** Open the React frontend (`http://localhost:5173`) and click the "Success Button" several times.
2. **Check the Raw Metrics:** Navigate to `http://localhost:3040/metrics` in your browser. You should see a large list of text, including the `backend_success_requests_total` metric reflecting your clicks.
3. **Check the Scraper:** Navigate to `http://localhost:9090/targets` and verify that the `nodejs_backend` endpoint is marked as **UP** (green).
4. **View in Grafana:** * Open Grafana (`http://localhost:3001`).
   * Go to **Explore** (the compass icon).
   * Ensure your **Mimir** data source is selected.
   * Run the query: `backend_success_requests_total`.
   * **Success:** You should see a graph displaying the exact number of times you clicked the success button!