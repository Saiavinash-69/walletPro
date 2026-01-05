# 💳 Wallet Management System

A full-stack financial dashboard featuring a **React (Vite/Tailwind)** frontend and a **Node.js (TypeScript)** backend. This application is served as a single package on **Port 3000**, utilizing an in-memory database with decimal precision.

---

## 🛠️ Prerequisites

To run the deployment pipeline, your machine needs:

1. **AWS CLI**: [Installed](https://www.google.com/search?q=https://awscli.amazonaws.com/AWSCLIV2.msi) and configured via `aws configure`.
2. **Terraform**: [Installed](https://developer.hashicorp.com/terraform/install) and in System PATH.
3. **Docker Desktop**: Running with WSL 2 engine.
4. **Node.js**: Version **20.x** or **22.x** (Vite 7 requirement).

---

## 🚀 Local Development

You can run the frontend and backend together using the build script:

1. **Install all dependencies:**
```powershell
npm install && cd frontend && npm install && cd ..

```


2. **Run the Flow (Build + Start):**
```powershell
npm run start:server

```


* *App runs at: `http://localhost:3000` (UI + API)*
* *API Docs at: `http://localhost:3000/api-docs*`



---

## 🚢 Deployment (`deploy.sh`)

The deployment script handles the end-to-end lifecycle of the full-stack app:

```bash
./deploy.sh

```

**What the script does for you:**

1. **Frontend Build**: Compiles React/Tailwind into static assets.
2. **Sync**: Moves static assets into the backend `public` folder.
3. **Multi-Stage Build**: Creates a single Docker image containing both the server and the UI.
4. **Rolling Update**: Pushes the image to **Amazon ECR** and triggers a zero-downtime refresh on **AWS ECS**.

---

## 📑 Access Points

| Component | URL / Endpoint | Purpose |
| --- | --- | --- |
| **Dashboard** | `http://[AWS-URL]:3000/` | Interactive React UI |
| **API Docs** | `http://[AWS-URL]:3000/api-docs` | Swagger Open-API Documentation |
| **API Setup** | `POST /setup` | Initialize a new wallet |
| **API Transact** | `POST /transact/:id` | Credit or Debit a specific wallet |

---

## 📂 Project Structure

```text
wallet-pro/
├── frontend/          # React + Vite + Tailwind (Dashboard UI)
├── src/               # Node.js + Express (API Backend)
├── public/            # Compiled UI assets (Served by Node)
├── terraform/         # AWS Infrastructure (VPC, ECR, ECS, EC2)
├── Dockerfile         # Multi-stage build (UI -> Server -> Production)
├── deploy.sh          # Automation script for build & push
└── docker-compose.yml # Local container orchestration

```

---

## 🔍 Monitoring & Maintenance

* **Port Mapping**: The application is running on **Port 3000**.
* **Logs**: View logs (UI requests + API processing) in **AWS CloudWatch**.
* **Clean Up**: To stop all AWS costs, run `terraform destroy` in the `/terraform` directory.

---
