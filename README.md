# MAIT AI-Powered College Information Assistant

**Institution**: Maharaja Agrasen Institute of Technology (MAIT), New Delhi  
**Project**: AI-Powered College Information Assistant (Minor Project)

---

## 1. Project Overview

The **MAIT AI-Powered College Information Assistant** is an institutional web application built to streamline student inquiries and alleviate the administrative workload of college staff. Students can ask natural-language questions about college admissions, semester examination schedules, fee payment guidelines, attendance regulations, timetables, department facilities, and campus amenities.

---

## 2. Core Architectural Principle

> **"VERIFIED MAIT INFORMATION FIRST. GENERAL AI SECOND."**

1. **Verified MAIT Information Available**:
   - If the student's query matches verified records stored in the administrative SQL database:
   - The LLM formulates a natural, direct answer strictly using the verified institutional facts.
   - The response is marked with **`✓ MAIT Verified`** (`MAIT_VERIFIED`).

2. **No Verified Information Available**:
   - If the query asks for general academic guidance or about a topic not yet recorded in the verified database:
   - The LLM synthesizes a polite, helpful general guidance answer without hallucinating official institutional dates, fees, or private policies.
   - The response is marked with **`✨ AI Generated`** (`AI_GENERATED`).

---

## 3. Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - Lucide React (Lightweight SVG Icons)
  - React Router DOM v6
  - Axios (with JWT Interceptors)
- **Backend**:
  - Python 3.10+ / 3.13
  - FastAPI (High-performance Async REST API)
  - Pydantic v2 & Pydantic-Settings
  - SQLAlchemy 2.0 ORM
- **Database**:
  - SQLite for local development (architected cleanly for seamless PostgreSQL migration)
- **AI & LLM Layer**:
  - Provider Abstraction supporting **Google Gemini API**, **OpenAI API**, and an offline **Intelligent Mock Engine**
  - Prompt Engineering enforcing verified-first institutional rules
- **Security & Authentication**:
  - PBKDF2-HMAC-SHA256 password hashing with random 16-byte cryptographic salts
  - JWT Bearer Authentication for protected Admin Portal routes

---

## 4. High-Level Architecture

```
                       STUDENT
                          |
                          v
                 REACT FRONTEND (Vite)
                          |
                          v  POST /api/chat
                 FASTAPI BACKEND
                          |
                          v
            SEARCH VERIFIED MAIT DATABASE
                          |
               +----------+----------+
               |                     |
               v                     v
      VERIFIED INFORMATION       NO VERIFIED
           FOUND                 INFORMATION
               |                     |
               v                     v
      LLM Synthesizes with       LLM Synthesizes
         Verified Facts          General Fallback
               |                     |
               v                     v
        ✓ MAIT VERIFIED        ✨ AI GENERATED
               |                     |
               +----------+----------+
                          |
                          v
                Logged to SQL Database
                          |
                          v
                 REACT FRONTEND (User)
```

---

## 5. Folder Structure

```
/Users/dhruvtiwari/minor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entrypoint, CORS, routers
│   │   ├── config.py                # Environment configuration
│   │   ├── database.py              # SQLAlchemy engine & SessionLocal
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── admin.py             # Admin user
│   │   │   ├── category.py          # Category model
│   │   │   ├── knowledge.py         # KnowledgeEntry model
│   │   │   ├── query_log.py         # QueryLog model
│   │   │   └── feedback.py          # Feedback model
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   │   ├── auth.py
│   │   │   ├── category.py
│   │   │   ├── knowledge.py
│   │   │   ├── chat.py
│   │   │   ├── dashboard.py
│   │   │   └── feedback.py
│   │   ├── api/                     # REST route controllers
│   │   │   ├── health.py            # GET /api/health
│   │   │   ├── auth.py              # POST /api/admin/login, GET /api/admin/me
│   │   │   ├── chat.py              # POST /api/chat
│   │   │   ├── categories.py        # CRUD /api/admin/categories
│   │   │   ├── knowledge.py         # CRUD /api/admin/knowledge
│   │   │   ├── dashboard.py         # GET /api/admin/dashboard
│   │   │   ├── queries.py           # GET /api/admin/queries
│   │   │   └── feedback.py          # POST /api/feedback, GET /api/admin/feedback
│   │   ├── services/
│   │   │   ├── retrieval_service.py # Database search & relevance scoring
│   │   │   ├── llm_service.py       # Gemini / OpenAI / Mock LLM engine
│   │   │   ├── chat_service.py      # Query orchestration
│   │   │   ├── knowledge_service.py # Category & Knowledge CRUD
│   │   │   └── auth_service.py      # Password & JWT verification
│   │   ├── prompts/
│   │   │   └── assistant_prompt.py  # System prompts enforcing verified rules
│   │   ├── utils/
│   │   │   └── security.py          # Hashing & token utils
│   │   └── seed/
│   │       └── seed_data.py         # Database seeding script
│   ├── tests/                       # Pytest test suite (20 automated tests)
│   ├── requirements.txt             # Python requirements
│   └── .env.example                 # Environment variables template
├── frontend/
│   ├── public/
│   │   ├── mait-logo.png            # Official MAIT Logo
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Header.jsx           # MAIT branding & navigation
│   │   │   ├── SourceBadge.jsx      # Verified vs AI badges
│   │   │   ├── ChatMessage.jsx      # Message bubble & feedback
│   │   │   ├── SuggestedQuestions.jsx # Quick suggestion pills
│   │   │   ├── LoadingIndicator.jsx # Typing animation
│   │   │   ├── Modal.jsx            # Accessible dialog
│   │   │   ├── Toast.jsx            # Toast alerts
│   │   │   └── ConfirmDialog.jsx    # Safe deletion dialog
│   │   ├── pages/
│   │   │   ├── StudentChatPage.jsx  # Student chatbot interface
│   │   │   ├── AdminLoginPage.jsx   # Admin authentication
│   │   │   ├── AdminDashboard.jsx   # Database-driven stats
│   │   │   ├── AdminKnowledge.jsx   # Full Knowledge CRUD
│   │   │   ├── AdminCategories.jsx  # Full Category CRUD
│   │   │   ├── AdminQueries.jsx     # Query history & fallback review
│   │   │   └── AdminFeedback.jsx    # Student feedback reviews
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx      # Admin sidebar layout
│   │   ├── services/
│   │   │   └── api.js               # Centralized API service
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication provider
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # React root
│   │   └── index.css                # Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
└── .gitignore
```

---

## 6. Prerequisites

- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** and **npm 9+**

---

## 7. Step-by-Step Installation & Setup

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd /Users/dhruvtiwari/minor/backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize and seed the database with default admin and verified categories:
   ```bash
   python -m app.seed.seed_data
   ```

---

### Step 2: WHERE TO ADD YOUR LLM API KEY

The application includes an **Intelligent Mock Mode** (`LLM_ENABLED=false` or `LLM_PROVIDER=mock`) that runs completely offline without any API key.

When you are ready to connect a live LLM (e.g., Google Gemini or OpenAI):

1. Copy `.env.example` to `.env` in `backend/`:
   ```bash
   cp .env.example .env
   ```

2. Open `backend/.env` in your text editor.

3. Update the following configuration lines:
   ```env
   # Enable live LLM API calls
   LLM_ENABLED=true

   # Choose your provider ("gemini" or "openai")
   LLM_PROVIDER=gemini

   # Paste your actual API key here (NEVER commit this file to Git)
   LLM_API_KEY=AIzaSyYourActualGeminiApiKeyHere

   # Specify model name
   LLM_MODEL=gemini-1.5-flash
   ```

4. Save the `.env` file. The backend will automatically use the live LLM API on your next query.

---

### Step 3: Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd /Users/dhruvtiwari/minor/frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 8. Running the Application Locally

### 1. Start the Backend Server:
In your backend terminal (with virtual environment active):
```bash
cd /Users/dhruvtiwari/minor/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
- The backend API will be live at: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- Redoc API Documentation: `http://127.0.0.1:8000/redoc`

### 2. Start the Frontend Development Server:
In your frontend terminal:
```bash
cd /Users/dhruvtiwari/minor/frontend
npm run dev
```
- Open your browser and navigate to: `http://localhost:5173`

---

## 9. Default Administrator Credentials

- **Login URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## 10. Key Application Workflows

### Workflow 1: Student Asking a Verified Question
1. Student enters: `"When are the semester exams?"` or `"Exam kab se hai?"`
2. Backend searches the verified database and matches the Examination Schedule record.
3. LLM formulates a response using official dates.
4. Chatbot displays the answer with the **`✓ MAIT Verified`** badge.

### Workflow 2: Student Asking a General Fallback Question
1. Student enters: `"What is the difference between a backlog and a supplementary exam?"`
2. Backend searches verified database; no specific institutional record exists.
3. LLM formulates a helpful academic guidance response.
4. Chatbot displays the answer with the **`✨ AI Generated`** badge.

### Workflow 3: Admin Creating New Institutional Information
1. Admin logs into `http://localhost:5173/admin/login`.
2. Admin navigates to **Categories** → clicks **+ Create Category** → creates `"Scholarships"`.
3. Admin navigates to **Knowledge Base** → clicks **+ Add Knowledge Entry**:
   - Category: `Scholarships`
   - Title: `Merit-cum-Means Scholarship 2026`
   - Question: `How do I apply for a scholarship at MAIT?`
   - Answer: `Applications for Delhi Government Merit-cum-Means Scholarship are submitted via the e-District portal by 30 October 2026.`
   - Keywords: `scholarship, merit, financial aid, concession`
   - Verified: `YES`
4. Admin saves. The SQL database is updated immediately.
5. In the Student Chatbot, asking `"How do I apply for scholarship?"` now immediately returns the newly added verified data with the **`✓ MAIT Verified`** badge!

---

## 11. Automated Test Suite

To run all 20 backend unit and integration tests:
```bash
cd /Users/dhruvtiwari/minor/backend
source venv/bin/activate
pytest -v tests
```

### Test Coverage Summary:
- `test_auth.py`: Health check, admin login, invalid credentials, JWT route protection.
- `test_categories.py`: Category creation, duplicate prevention, updates, and safe deletion prevention when entries exist.
- `test_knowledge.py`: Knowledge entry creation, category assignment, updates, keyword search, and deletion.
- `test_chat.py`: Verified response flow (`MAIT_VERIFIED`), fallback general flow (`AI_GENERATED`), feedback submission.
- `test_dashboard.py`: Live stats computation, query logs filtering.

---

## 12. Future Deployment Notes

For eventual production deployment:
1. **Database**: Switch `DATABASE_URL` in `.env` to a managed PostgreSQL instance (`postgresql://user:pass@host:5432/mait_db`).
2. **Reverse Proxy & SSL**: Serve FastAPI via Gunicorn/Uvicorn workers behind Nginx with Let's Encrypt SSL certificates.
3. **Frontend Bundle**: Build optimized static assets (`npm run build`) and serve via Nginx or Cloudflare Pages.
