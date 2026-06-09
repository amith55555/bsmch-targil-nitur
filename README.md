# Branch: `feat/frontend-faro-logs`

## 🎯 The Task
The objective of this task is to instrument our React frontend to capture browser telemetry and custom user events, and securely route that data into our observability stack.

Specifically, this branch accomplishes the following:
1. Deploys Grafana Alloy as a telemetry bridge to receive frontend payloads.
2. Implements an active processing pipeline in Alloy to extract metadata and promote it to native Loki labels.
3. Instruments the React application with the Grafana Faro Web SDK.
4. Forwards the frontend logs securely to our existing Loki database under the `devops-sre` tenant.
5. Configures the Loki datasource in the Grafana UI for seamless querying.

---

## 🛠️ Tools & Packages Used
* **`@grafana/faro-web-sdk` (npm package):** The official Grafana SDK used inside the React app to automatically capture Web Vitals, console logs, unhandled errors, and custom application logs.
* **Grafana Alloy:** Configured with a three-stage pipeline (Receiver -> Processor -> Writer) to ingest data, extract logfmt metadata, and route it to Loki.
* **Docker & Docker Compose:** Used to spin up the new Alloy container and manage network routing (`host.docker.internal`).
* **Grafana & Loki:** Used as the backend storage database and visualization layer for the log streams.

---

## ✅ What We Did (Step-by-Step Solution)

### Step 1: Deploying the Grafana Alloy Pipeline
Created a new `alloy/config.alloy` file defining a smart routing and extraction pipeline:
1. **The Receiver:** Configured a `faro.receiver` listening on port `12347`, explicitly allowing CORS from our frontend (`http://localhost:5173`).
2. **The Processor (`loki.process`):** Created a middleman stage to parse the incoming `logfmt` payload. It extracts the `app_name` and `environment` keys trapped in the text and promotes them into permanent, indexed Loki labels (`service_name` and `environment`).
3. **The Writer:** Configured a `loki.write` endpoint targeting our host's Loki instance (`http://host.docker.internal:3100/loki/api/v1/push`), injecting the `tenant_id = "devops-sre"` to ensure isolation.

### Step 2: Instrumenting the React Frontend
1. **Install SDK:** Ran `npm install @grafana/faro-web-sdk` in the `/react-frontend` directory.
2. **Initialize Faro:** Updated `main.tsx` to call `initializeFaro()` before the React tree renders. 
   * Configured it to push data to Alloy at `http://localhost:12347/collect`.
   * Explicitly set the app name to `react-frontend-ui` and the environment to `development` so Alloy can extract them.
3. **Add Custom Logs:** Updated the button click handlers in `App.tsx` to push explicit, structured logs using the strict `LogLevel.INFO` and `LogLevel.WARN` enums.

### Step 3: Configuring the Datasource in Grafana UI
Connected Grafana to read the newly processed logs:
1. Navigated to **Connections > Data sources** and selected **Loki**.
2. **URL:** Configured the URL as `http://loki:3100` (utilizing the internal Docker bridge network).
3. **Authentication:** Added a Custom HTTP Header with Key: `X-Scope-OrgID` and Value: `devops-sre`.

---

## 🔍 Verification: Test Your Logs!

To ensure the entire frontend-to-backend pipeline works end-to-end:

1. **Generate Telemetry:** Open the React frontend (`http://localhost:5173`) and click both the "Success" and "Failure" buttons a few times.
2. **Verify in Grafana:** * Open Grafana (`http://localhost:3001`) and navigate to **Explore**.
   * Select the **Loki** data source.
   * Because of our Alloy extraction pipeline, you can now use the **Label filters** dropdown directly! 
   * Select `service_name` = `react-frontend-ui` and run the query.
   * **Success:** You will see a rich stream of frontend logs, cleanly indexed and ready for standard community dashboards.