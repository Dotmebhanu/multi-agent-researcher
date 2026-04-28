"""
FastAPI server — exposes the multi-agent pipeline as a REST API.
Run: uvicorn api:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import build_graph, ResearchState
import uvicorn

app = FastAPI(
    title="Multi-Agent Research Assistant API",
    description="LangGraph pipeline: Searcher → Summarizer → Report Writer",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://multi-agent-researcher-84s3.vercel.app/"  # your actual vercel URL
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build graph once at startup
research_graph = build_graph()


class ResearchRequest(BaseModel):
    topic: str


class ResearchResponse(BaseModel):
    topic: str
    final_report: str
    sources_count: int
    logs: list[str]


@app.get("/")
def root():
    return {"status": "running", "message": "Multi-Agent Research Assistant API"}


@app.post("/research", response_model=ResearchResponse)
async def run_research(request: ResearchRequest):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    initial_state: ResearchState = {
        "topic": request.topic,
        "search_results": [],
        "summaries": [],
        "final_report": "",
        "logs": []
    }

    try:
        result = research_graph.invoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ResearchResponse(
        topic=result["topic"],
        final_report=result["final_report"],
        sources_count=len(result["summaries"]),
        logs=result["logs"]
    )


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)