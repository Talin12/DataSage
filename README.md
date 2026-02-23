# DataSage — AI-Powered Data Visualization Dashboard

DataSage lets you upload structured datasets and query them using plain English. It sends your question to an LLM, which returns a structured JSON render plan. The React frontend parses that plan and renders interactive charts and tables automatically.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (running locally or via a cloud provider)
- A [Hugging Face](https://huggingface.co/settings/tokens) account with an API token

---

## Backend Setup
```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your database credentials and HF API key

# 4. Run migrations
python manage.py migrate

# 5. Seed sample data
python manage.py seed_sales_data
```

## Frontend Setup
```bash
cd frontend
npm install
```

---

## Running the Application

In two separate terminals:
```bash
# Terminal 1 — Django backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2 — Vite dev server
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.  
The API runs at `http://localhost:8000/api/`.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React, Vite, Recharts, Styled Components |
| Backend  | Django, Django REST Framework     |
| Database | PostgreSQL                        |
| AI       | Hugging Face Inference API (Llama 3.1) |