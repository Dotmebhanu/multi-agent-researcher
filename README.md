<div align="center">

# ✦ Multi-Agent Research Assistant

**Turn any topic into a structured, cited research report — in seconds.**

Three specialized AI agents collaborate in a real-time pipeline powered by LangGraph, Groq LLaMA 3.3 70B, and Tavily Search.

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-FF6B6B?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

![App Screenshot Placeholder](https://placehold.co/900x500/0a0a0f/a78bfa?text=Multi-Agent+Research+Assistant&font=raleway)

</div>

---

## What It Does

You type a research topic. Three AI agents immediately get to work:

```
Your Topic
    │
    ▼
┌──────────────────┐
│  🔍  Searcher    │  → Queries Tavily for 5 live web sources
└────────┬─────────┘
         │ search_results[]
         ▼
┌──────────────────┐
│  📝  Summarizer  │  → LLaMA 3.3 70B extracts key facts per source
└────────┬─────────┘
         │ summaries[]
         ▼
┌──────────────────┐
│  ✦   Writer     │  → Synthesizes everything into a structured report
└────────┬─────────┘
         │
         ▼
   📄 Final Report (Markdown, with citations)
```

Each agent has a single responsibility. All share a typed `ResearchState` dict that flows through LangGraph's `StateGraph`. Clean, composable, auditable.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Agent Orchestration | **LangGraph 0.2** | Typed state machine for multi-agent pipelines |
| LLM | **Groq · LLaMA 3.3 70B** | Ultra-fast inference for summarization & writing |
| Web Search | **Tavily Search API** | Real-time, research-grade web results |
| Backend | **FastAPI + Uvicorn** | Async REST API exposing the pipeline |
| Frontend | **React 18 + Vite** | Dark-themed UI with real-time agent status |

---

## Project Structure

```
multi-agent-researcher/
│
├── backend/
│   ├── agents.py          # Core LangGraph pipeline — 3 agent nodes
│   ├── api.py             # FastAPI REST server
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main UI — agent cards, input, report view
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .env.example           # Environment variable template
└── README.md
```

---

## Quickstart

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- A free [Tavily API key](https://tavily.com)

---

### 1 · Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/multi-agent-researcher.git
cd multi-agent-researcher
```

### 2 · Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3 · Add your API keys

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
```

### 4 · Start the API server

```bash
uvicorn api:app --reload
# Running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 5 · Start the frontend

```bash
cd ../frontend
npm install
npm run dev
# Running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), type any topic, and hit **Run research**.

---

## API Reference

### `POST /research`

Run the full multi-agent pipeline on a topic.

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "Latest advancements in RAG pipelines"}'
```

**Response:**

```json
{
  "topic": "Latest advancements in RAG pipelines",
  "final_report": "# Research Report: ...",
  "sources_count": 5,
  "logs": [
    "Searcher: Found 5 results for '...'",
    "Summarizer: Produced 5 summaries",
    "Report Writer: Final report generated"
  ]
}
```

### `GET /health`

```json
{ "status": "healthy" }
```

---

## Key Concepts

**LangGraph StateGraph** — The pipeline is a directed acyclic graph where each agent is a node. State flows forward and is never mutated in-place; each node returns a new state dict. This makes the pipeline easy to debug, test, and extend.

**Single-responsibility agents** — The Searcher doesn't summarize. The Summarizer doesn't search. The Writer doesn't fetch. Each agent does exactly one thing well — classic Unix philosophy applied to AI.

**Audit logging** — Every agent appends to `state["logs"]` via LangGraph's `Annotated[list, operator.add]` — a reducer that merges lists instead of overwriting them. You get a full trace of every agent action.

**Structured LLM outputs** — System prompts enforce consistent formatting (Executive Summary → Key Findings → Analysis → Conclusion → Sources). The Writer receives pre-digested summaries, not raw HTML soup.

---

## Deployment

### Backend → Render / Railway / Fly.io

1. Push your code to GitHub
2. Connect your repo on [Render](https://render.com) or [Railway](https://railway.app)
3. Set environment variables (`GROQ_API_KEY`, `TAVILY_API_KEY`) in the dashboard
4. Start command: `uvicorn api:app --host 0.0.0.0 --port 8000`

### Frontend → Vercel / Netlify

1. Update `API_BASE` in `App.jsx` to your deployed backend URL
2. Push to GitHub
3. Import the repo on [Vercel](https://vercel.com) — it auto-detects Vite
4. Done — your frontend is live

---

## Roadmap

- [ ] Streaming responses (Server-Sent Events)
- [ ] Export report as PDF
- [ ] Add a Critic agent for fact-checking
- [ ] Persistent report history
- [ ] Multi-query parallel search

---

## Author

Built by **Bhanuprakash Reddy**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com)

---

<div align="center">
<sub>Built with LangGraph · Groq · Tavily · FastAPI · React</sub>
</div>
