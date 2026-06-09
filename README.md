# Branch: `feat/add-frontend-faro`

## 🎯 The Task
The objective of this task is to instrument our React frontend to capture browser telemetry and custom user events, and securely route that data into our observability stack.

Specifically, this branch accomplishes the following:
1. Deploys Grafana Alloy as a lightweight pipeline to receive frontend telemetry.
2. Instruments the React application with the Grafana Faro Web SDK.
3. Implements custom, structured logging for user interactions (button clicks).
4. Forwards the frontend logs securely to our existing Loki database under the `devops-sre` tenant.
5. Manually configures the Loki datasource in the Grafana UI to query and visualize the browser data.

---

## 🛠️ Tools & Packages Used
* **`@grafana/faro-web-sdk` (npm package):** The official Grafana SDK used inside the React app to automatically capture Web Vitals, console logs, unhandled errors, and custom application logs.
* **Grafana Alloy:** A vendor-neutral telemetry collector configured to act as a bridge. It receives the Faro payloads via HTTP and translates them into a format Loki understands.
* **Docker & Docker Compose:** Used to spin up the new Alloy container and manage network routing (`host.docker.internal`).
* **Grafana & Loki:** Used as the backend storage database and visualization layer for the log streams.

---

## ✅ What We Did (Step-by-Step Solution)

### Step 1: Deploying Grafana Alloy
1. **Create Configuration:** Created a new `alloy/config.alloy` file defining a simple pipeline:
   * **Receiver:** Configured a `faro.receiver` listening on port `12347`. Crucially, added `cors_allowed_origins` for `http://localhost:5173` so the browser wouldn't block the requests.
   * **Exporter:** Configured a `loki.write` endpoint targeting our host's Loki instance (`http://host.docker.internal:3100/loki/api/v1/push`).
   * **Tenant Isolation:** Injected the `tenant_id = "devops-sre"` directly into the Loki write block to ensure the logs route to our specific bucket.
2. **Update Infrastructure:** Added the `alloy` service to the root `docker-compose.yml`, mapped ports `12347` (Faro) and `12345` (UI), and added `host.docker.internal:host-gateway` to the `extra_hosts` so Alloy could resolve the host network.

### Step 2: Instrumenting the React Frontend
1. **Install SDK:** Ran `npm install @grafana/faro-web-sdk` in the `/react-frontend` directory.
2. **Initialize Faro:** Updated `main.tsx` to call `initializeFaro()` before the React tree renders. 
   * Configured it to push data to Alloy at `http://localhost:12347/collect`.
   * Explicitly set the app name to `react-frontend-ui` to act as our core service identifier.
3. **Add Custom Logs:** Updated the button click handlers in `App.tsx` to push explicit, structured logs (`faro.api.pushLog`) using the strict `LogLevel.INFO` and `LogLevel.WARN` enums before firing network requests.

### Step 3: Configuring the Datasource in Grafana UI
With the frontend successfully shipping logs through Alloy into Loki, we connected Grafana to read them:
1. Navigated to **Connections > Data sources** and selected **Loki**.
2. **URL:** Configured the URL as `http://loki:3100` (utilizing the internal Docker bridge network for secure Grafana-to-Loki communication).
3. **Authentication:** Added a Custom HTTP Header with Key: `X-Scope-OrgID` and Value: `devops-sre`.
4. Clicked **Save & test** to verify the connection.

---

## 🔍 Verification: Test Your Logs!

To ensure the entire frontend-to-backend pipeline works end-to-end:

1. **Generate Telemetry:** Open the React frontend (`http://localhost:5173`) and click both the "Success" and "Failure" buttons a few times.
2. **Verify in Grafana:** * Open Grafana (`http://localhost:3001`) and navigate to **Explore**.
   * Select the **Loki** data source.
   * Run the following LogQL query to isolate the frontend application:
     ```logql
     {app="react-frontend-ui"}
     ```
   * **Success:** You should see a rich stream of logs, including your custom `"Success button clicked by user"` messages, bundled with automatic browser metadata!