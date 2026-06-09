# Full-Stack React & Node.js App with Grafana Observability

This project contains a completely separated frontend and backend application. The core applications are containerized using standard Dockerfiles and are designed to be run independently using raw Docker CLI commands, giving you full control over the build and execution process.

An optional, production-grade observability stack (Grafana, Loki, Tempo, Mimir, Pyroscope) is also included for monitoring and debugging.

---

## 🏗️ Architecture & Services

### Application Layer (Standalone Containers)
* **Backend (`/backend-app`):** A Node.js API server that handles requests from the frontend and returns JSON data.
* **Frontend (`/react-frontend`):** A React/TypeScript application built with Vite. It is compiled into static files and served efficiently using a lightweight Nginx container.

### Observability Layer (Docker Compose)
* **Grafana:** The central visualization dashboard. Configured for anonymous admin access (no login required for local development).
* **Loki:** Log aggregation system.
* **Tempo:** Distributed tracing backend.
* **Mimir:** Scalable time-series database for metrics.
* **Pyroscope:** Continuous profiling for performance analysis.

---

## 🚀 Getting Started with the Application

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running on your machine.

### 1. Build and Run the Backend

The backend must be started first so the frontend has an API to communicate with. 

Navigate to the root directory of your project and build the backend image:
```bash
docker build -t my-backend ./backend-app
```

Run the backend container on port 3040:
```bash
docker run -d -p 3040:3040 --name backend my-backend
```
*The backend API is now reachable at `http://localhost:3040`.*

### 2. Build and Run the Frontend

With the backend running, build the frontend image:
```bash
docker build -t my-frontend ./react-frontend
```

Run the frontend container, mapping your local port `5173` to the container's internal Nginx port `80`:
```bash
docker run -d -p 5173:80 --name frontend my-frontend
```
*The frontend UI is now reachable at `http://localhost:5173`.*

---

## 🛑 Stopping and Cleaning Up

To stop the applications from running in the background, use the following command:

```bash
docker stop backend frontend
```

If you want to completely remove the containers so you can rebuild them from scratch, run:
```bash
docker rm backend frontend
```

---

## 📊 Optional: Running the Observability Stack

If you wish to monitor your applications, you can spin up the Grafana observability suite alongside your standalone containers. Because this involves 5 interconnected services, it is orchestrated via Docker Compose.

### Prerequisites for Observability
Ensure the following empty (or configured) configuration files exist in your root directory next to `docker-compose.yml`, otherwise Docker will fail to mount the volumes:
* `loki.yaml`
* `tempo.yaml`
* `mimir.yaml`
* `pyroscope.yaml`

### Start the Stack
Run the following command in your root directory:
```bash
docker-compose up -d
```

### Accessing Observability Tools
* **Grafana UI:** `http://localhost:3001`
* **Loki:** `3100`
* **Tempo:** `3200` (HTTP), `4317` (OTLP gRPC), `4318` (OTLP HTTP)
* **Mimir:** `9009`
* **Pyroscope:** `4040`

To stop the observability stack, run:
```bash
docker-compose down
```