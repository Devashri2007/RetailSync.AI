# RetailSync AI – Unified Customer, Channel & Demand Intelligence Platform

> **Track 02 – Customers, Channels & Demand**  
> An intelligent enterprise retail analytics and decision-support platform designed to break channel silos, eliminate reactive stock-outs, protect profit margins from excessive returns, and intercept customer churn signals directly from support interactions.

---

## 1. Executive Problem Statement & Solutions

RetailSync AI provides concrete algorithmic solutions to four fundamental retail failures:

| # | Industry Pain Point | RetailSync AI Engine Solution |
|---|-------------------|--------------------------------|
| **1** | **Customer Identity Fragmentation**<br>The same customer is identified differently across website, mobile app, and physical store touchpoints. | **Unified Customer Identity Engine**: Deterministic & fuzzy string matching (Levenshtein + phone/email matching), confidence scoring (0–100%), side-by-side human verification, and unified historical timelines. |
| **2** | **Reactive Stock-Outs**<br>Stock-outs are identified only after products become unavailable on shelves. | **AI Demand Forecasting**: Regression & time-series models anticipating 7, 15, and 30-day demand, identifying imminent stockouts, and suggesting replenishment quantities. |
| **3** | **Margin-Eroding Product Returns**<br>Frequent returns erode net profit margins due to return shipping, reverse logistics, and handling. | **Smart Return & Profit Protection**: Classification of return propensity by category/price, reverse logistics margin degradation quantification, and actionable product remediations (e.g. 3D sizing guide). |
| **4** | **Unused Churn Signals in Support**<br>Customer churn signals remain buried in customer support complaints until the customer stops purchasing. | **Customer Churn Early Warning System & Voice of Customer**: Real-time NLP sentiment extraction, purchase frequency recency tracking, and Explainable AI (XAI) factor breakdowns. |

---

## 2. Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Lucide React, Socket.IO Client.
- **Backend (MERN)**: Node.js 24, Express.js REST APIs, JWT Authentication, bcrypt password hashing, Mongoose ODM, Socket.IO for real-time alerting.
- **AI / Machine Learning Microservice**: Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib model persistence.
- **Database**: MongoDB 8.x with 14 normalized Mongoose collections.

---

## 3. Five Distinct User Roles & Demo Credentials

Every user role has tailored dashboards and strict backend route authorization guards:

| Role | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@retailsync.ai` | `Password@123` | Full system governance, user provisioning, global analytics, audit logs |
| **Inventory Manager** | `inventory@retailsync.ai` | `Password@123` | Stockout countdown, reorder points, 1-click replenishment execution |
| **Sales Manager** | `sales@retailsync.ai` | `Password@123` | Omnichannel sales (Web vs Mobile vs Store), AOV, return margin impact |
| **Customer Support** | `support@retailsync.ai` | `Password@123` | Support ticket queue, sentiment analysis, proactive churn interception |
| **Business Analyst** | `analyst@retailsync.ai` | `Password@123` | RFM customer segmentation, churn curves, What-If scenario simulator |

*(All demo credentials feature a 1-click auto-fill on the Login page and a live 1-click Role Switcher in the top navigation bar).*

---

## 4. Key Functional & AI Modules

### Innovation 1: Unified Customer Identity Engine
- Multi-channel ingestion from Web, Mobile App, and Physical Point of Sale.
- Candidate pair scanning with match confidence scores (0-100%).
- Side-by-side **Merge Preview Modal** comparing orders, addresses, and projected consolidated lifetime value.
- Profile consolidation creating unified customer ID, reassigning historical orders, tickets, and recording audit history.

### Innovation 2: AI Demand Forecasting
- GradientBoostingRegressor trained on multi-horizon sales velocity, pricing, and category elasticity.
- Predicts 7-day, 15-day, and 30-day demand curves.
- Automatic daily run-rate calculation and stockout countdown warnings.

### Innovation 3: Smart Return and Profit Protection
- Category and channel-specific return classification.
- Measures dollar impact of reverse logistics, packaging, and restocking.
- Automated quality remediation suggestions (e.g., updating sizing charts for apparel).

### Innovation 4: Customer Churn Early Warning System (XAI)
- RandomForestClassifier trained on RFM features (Recency, Frequency, Monetary) and ticket sentiment.
- Explainable AI (XAI) factor breakdown highlighting why a customer was flagged (e.g., `+35% likelihood due to 60+ days inactivity`).

### Innovation 5: Personalized Recommendations & Cross-Sell
- "Frequently Purchased Together" algorithms computing product affinities.
- Collaborative recommendations presented directly in customer profiles.

### Innovation 6: AI Business Action Center
- The central intelligence nerve center converting ML predictions into commercial business cards.
- Each action specifies: Target Entity, Reason, Priority Level (Critical, High, Medium), Prediction Evidence, and Suggested Action.
- One-click **Execute Action** buttons (e.g. auto-replenish stock, credit VIP loyalty retention points).

### Advanced Feature: What-If Demand & Price Simulator
- Interactive parameter sliders for Price, Demand, and Price Elasticity.
- Generates real-time comparisons of Projected Demand, Simulated Revenue, and Stockout Feasibility with empirical elasticity formulas.

---

## 5. Quick Start Guide

### Prerequisites
- Node.js >= 18 (Tested on Node 24)
- Python >= 3.10 (Tested on Python 3.12)
- MongoDB running locally on `127.0.0.1:27017`

### Step 1: Database Setup & Seeding
From the `backend` directory:
```bash
cd backend
npm install
npm run seed
```
*(This seeds 5 staff roles, 32 products, 105 customers with cross-channel duplicate identities, 160 orders, returns, and support tickets).*

### Step 2: Start the Python FastAPI ML Microservice
From the `ml_service` directory:
```bash
cd ml_service
# Run the training script (already pre-trained into saved_models/)
.venv\Scripts\python.exe train.py

# Launch FastAPI
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`.

### Step 3: Start the Express Backend
From the `backend` directory:
```bash
cd backend
npm start
```
Express REST API runs on: `http://localhost:5000`.

### Step 4: Start the Frontend UI
From the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`.

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Email/password login with JWT cookie & token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `GET` | `/api/analytics/admin-kpis` | Executive global KPI overview | Authenticated |
| `GET` | `/api/identity/candidates` | List cross-channel duplicate candidate pairs | Authenticated |
| `POST` | `/api/identity/merge` | Execute identity unification merge | Admin / Sales Mgr |
| `GET` | `/api/action-center` | Fetch prioritized AI commercial recommendations | Authenticated |
| `POST` | `/api/action-center/:id/execute` | Execute 1-click business action | Authenticated |
| `GET` | `/api/ai/demand-forecast` | 7, 15, 30-day demand predictions | Authenticated |
| `GET` | `/api/ai/churn-risk` | Churn classifications with Explainable AI factors | Authenticated |
| `POST` | `/api/ai/what-if-simulate` | Run price elasticity scenario simulator | Authenticated |
| `POST` | `/api/inventory/:id/restock` | Replenish inventory stock | Inventory / Admin |
| `GET` | `/api/tickets/voice-of-customer`| Sentiment distribution & complaint clusters | Authenticated |

---

## 7. License
Developed for Track 02 – Customers, Channels & Demand. ISC License.
