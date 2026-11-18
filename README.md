# MonoFit 👕👜

> **MonoFit** is a premium, multi-tenant fashion e-commerce and analytics platform featuring a responsive customer storefront, automated brand owner dashboards, and an AI-powered sales assistant.

### 🌐 Live Production URLs
* **Frontend Storefront:** [https://daily-deals-phi.vercel.app/](https://daily-deals-phi.vercel.app/)
* **Backend REST API:** [https://daily-deals-backend-ten.vercel.app/](https://daily-deals-backend-ten.vercel.app/)
* **AI Chatbot Space:** [https://muhammadumer34-daily-deals-chatbot.hf.space/health](https://muhammadumer34-daily-deals-chatbot.hf.space/health)

---

## 🚀 Key Features

* **Dynamic Multi-Tenant Architecture:** Separate client-facing marketplace interfaces (Customers) and backend inventory management layouts (Store Owners / Brands) with strict data isolation.
* **Store Owner Sales Dashboard:** Interactive charts (ApexCharts) displaying total revenue, orders, average order values, and order status summaries aggregated specifically for each store's products.
* **AI-Powered Customer Assistant:** Context-aware RAG chatbot running LangChain, Groq API (Llama 3.1), and Pinecone vector database to guide customer sizing, shipping, and store details.
* **Guest Browsing Flow:** Allows unauthenticated users to view the home page, filter categories, search items, and read reviews, prompting signups only on checkout, cart additions, wishlists, or review actions.
* **Premium Design System:** Modern dark glassmorphic panels (`backdrop-blur`), mesh background gradients, responsive split layouts, and custom-styled scrolling grids.

---

## 🛠️ Technology Stack

### 1. Frontend Storefront (`client/`)
* **Core Framework:** React 19, Vite (Fast HMR Bundler)
* **State Management:** Redux Toolkit & React-Redux
* **Routing:** React Router DOM v7
* **Styling:** Tailwind CSS v4 (Custom Glassmorphism, animations) & Material UI / Radix UI Icons
* **Charts:** ApexCharts & React-ApexCharts

### 2. REST API Backend (`server/`)
* **Runtime Environment:** Node.js & Express
* **Database Driver:** Mongoose (MongoDB ODM)
* **Authentication:** JSON Web Tokens (JWT) & Cookie Parser
* **Security & CORS:** Dynamic Origin filtering matching client configurations

### 3. AI Chatbot Agent (`chatbot/`)
* **Web Framework:** Python 3.11, FastAPI
* **Orchestration:** LangChain (RetrievalQA chain)
* **Inference Model:** ChatGroq (Llama-3.1-8b-instant model)
* **Vector Store:** Pinecone Vector Database
* **Embeddings:** HuggingFace Embeddings (`BAAI/bge-large-en-v1.5`)

---

## 📦 Project Structure

```bash
Daily-Deals/
├── client/          # React + Vite Frontend
│   ├── src/
│   │   ├── components/  # Shared layouts, Headers, Sidebars
│   │   ├── features/    # Redux slices, Axios API handlers
│   │   └── pages/       # Store owner & customer pages
│   └── package.json
│
├── server/          # Node.js + Express REST API
│   ├── controllers/ # Aggregations, checkout, and product controllers
│   ├── models/      # MongoDB schemas (Users, Products, StoreOrders, Carts)
│   ├── routes/      # Mapped Express Routers
│   └── vercel.json  # Serverless deployment configuration
│
└── chatbot/         # Python FastAPI AI Chatbot
    ├── main.py      # Request endpoints (/ask, /health)
    ├── setup.py     # Pinecone and ChatGroq connections
    ├── qa_chain.py  # LangChain prompts and summarizers
    └── Dockerfile   # Deployment container configuration
```

---

## ⚙️ Local Installation & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (3.10+)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas Cloud Cluster)

---

### Setup Instructions

#### 1. Clone the repository
```bash
git clone https://github.com/Muhammad-Umer34/Daily-Deals.git
cd Daily-Deals
```

#### 2. Run the Express Backend Server
1. Navigate into the `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file inside `server/`:
   ```properties
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_access_secret
   REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
   FRONTEND_URL=http://localhost:5173
   ```
3. Start the server:
   ```bash
   npm start
   ```

#### 3. Run the React Frontend Client
1. In a new terminal, navigate into the `client` directory:
   ```bash
   cd client
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

#### 4. Run the Python Chatbot
1. In a new terminal, navigate into the `chatbot` directory:
   ```bash
   cd chatbot
   python -m venv venv
   .\venv\Scripts\activate   # On Windows
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```
2. Create a `.env` file inside `chatbot/`:
   ```properties
   GROQ_API_KEY=your_groq_key
   PINECONE_API_KEY=your_pinecone_key
   ```
3. Start the chatbot server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

## 🤖 Shop Assistant (`/assistant`)

A chat page where a customer describes what they want instead of browsing. It searches the live catalogue, shows real products as cards, narrows the search on request, builds the cart, and places the order only after the customer presses **Confirm order** on a summary card. Open to logged-out visitors for search; the cart and checkout need an account. Separate from the help chatbot in `chatbot/` (which stays as it is).

Lives in the Express backend: `server/services/assistant/` (OpenRouter client, tools, agent loop), `server/controllers/assistantController.js`, and `client/src/pages/customers/assistant.jsx`. Placing an order runs the same `placeOrder` as the normal checkout (`server/services/orders.js`); the chat can never order on its own — the confirmation token is signed, bound to one user/c/address/cart state, expires in 10 minutes, and is single-use.

### Settings (Vercel backend project + `server/.env`)

| Name | Purpose |
| --- | --- |
| `ASSISTANT_API_KEY` | OpenRouter key, **separate** from the help chatbot's key |
| `ASSISTANT_MODEL` | Main model id (e.g. `openai/gpt-6-luna`) |
| `ASSISTANT_FALLBACK_MODEL` | OpenRouter switches here automatically if the main model fails |
| `ASSISTANT_ORDER_SECRET` | Long random string; signs order-confirmation tokens |
| `ASSISTANT_RATE_GUEST` / `ASSISTANT_RATE_USER` | Messages per hour, per IP / per account (default 30 / 100) |

Also set a **monthly credit limit** on the key in the OpenRouter dashboard — out of credit shows a friendly "assistant is unavailable" reply, never an error page.

### Changing the model

1. `npm run test:models` — probes candidate models with a fixed tool-calling prompt and prints pass/fail, latency and argument quality.
2. Set `ASSISTANT_MODEL` / `ASSISTANT_FALLBACK_MODEL` from the result. No code change needed.

### Tests and reports

```bash
npm test                    # offline unit tests: filter escaping, order token, phone, pricing
npm run test:conversations  # ~25 scripted chats through the real model + database; saves a results file
npm run report:assistant    # 7-day token cost + searches that found nothing
```

Run `npm run test:conversations` again after any model or prompt change and compare with the saved result files.

---

## 🌐 Deployment Configuration

* **Frontend & Backend:** Hosted on **Vercel**. The Express server routes are serverless-compatible and utilize the configuration in `server/vercel.json`.
* **Chatbot Database:** Hosted on **Hugging Face Spaces** as a Docker Space running on port `7860`.
