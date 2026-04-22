"""
Multi-Agent Research Assistant
Agents: Searcher → Summarizer → Report Writer
"""

import os
from dotenv import load_dotenv
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage, SystemMessage
import operator

load_dotenv()

# ─────────────────────────────────────────────
# 1. SHARED STATE
# ─────────────────────────────────────────────
class ResearchState(TypedDict):
    topic: str                          # user's research query
    search_results: list[dict]          # raw results from Tavily
    summaries: list[str]                # per-result summaries
    final_report: str                   # formatted final report
    logs: Annotated[list[str], operator.add]  # audit trail


# ─────────────────────────────────────────────
# 2. LLM + TOOLS
# ─────────────────────────────────────────────
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY")
)

search_tool = TavilySearchResults(
    max_results=5,
    api_key=os.getenv("TAVILY_API_KEY")
)


# ─────────────────────────────────────────────
# 3. AGENT NODES
# ─────────────────────────────────────────────

def searcher_agent(state: ResearchState) -> ResearchState:
    """Agent 1: Searches the web for the topic using Tavily."""
    topic = state["topic"]
    print(f"\n🔍 [Searcher Agent] Searching for: {topic}")

    results = search_tool.invoke(topic)

    return {
        **state,
        "search_results": results,
        "logs": [f"Searcher: Found {len(results)} results for '{topic}'"]
    }


def summarizer_agent(state: ResearchState) -> ResearchState:
    """Agent 2: Summarizes each search result individually."""
    print(f"\n📝 [Summarizer Agent] Summarizing {len(state['search_results'])} results...")

    summaries = []
    for i, result in enumerate(state["search_results"]):
        content = result.get("content", "")
        url = result.get("url", "")

        if not content:
            continue

        messages = [
            SystemMessage(content=(
                "You are a precise research summarizer. "
                "Given a web page excerpt, extract the key facts relevant to the research topic. "
                "Be concise — 3 to 5 bullet points max. Always cite the source URL at the end."
            )),
            HumanMessage(content=(
                f"Research topic: {state['topic']}\n\n"
                f"Source URL: {url}\n\n"
                f"Content:\n{content[:3000]}"
            ))
        ]

        response = llm.invoke(messages)
        summary = f"**Source {i+1}:** {url}\n{response.content}"
        summaries.append(summary)
        print(f"  ✅ Summarized source {i+1}")

    return {
        **state,
        "summaries": summaries,
        "logs": [f"Summarizer: Produced {len(summaries)} summaries"]
    }


def report_writer_agent(state: ResearchState) -> ResearchState:
    """Agent 3: Synthesizes all summaries into a structured final report."""
    print(f"\n📊 [Report Writer Agent] Writing final report...")

    combined_summaries = "\n\n".join(state["summaries"])

    messages = [
        SystemMessage(content=(
            "You are an expert research report writer. "
            "Given summaries from multiple sources, write a well-structured research report. "
            "Format:\n"
            "# Research Report: [Topic]\n\n"
            "## Executive Summary\n(2-3 sentences)\n\n"
            "## Key Findings\n(numbered list of most important facts)\n\n"
            "## Detailed Analysis\n(paragraph form, synthesize across sources)\n\n"
            "## Conclusion\n(1 paragraph)\n\n"
            "## Sources\n(list all URLs referenced)\n\n"
            "Be factual, clear, and cite sources inline where relevant."
        )),
        HumanMessage(content=(
            f"Research Topic: {state['topic']}\n\n"
            f"Source Summaries:\n{combined_summaries}"
        ))
    ]

    response = llm.invoke(messages)

    return {
        **state,
        "final_report": response.content,
        "logs": ["Report Writer: Final report generated"]
    }


# ─────────────────────────────────────────────
# 4. BUILD THE GRAPH
# ─────────────────────────────────────────────
def build_graph():
    graph = StateGraph(ResearchState)

    # Add nodes
    graph.add_node("searcher", searcher_agent)
    graph.add_node("summarizer", summarizer_agent)
    graph.add_node("report_writer", report_writer_agent)

    # Define flow: searcher → summarizer → report_writer → END
    graph.set_entry_point("searcher")
    graph.add_edge("searcher", "summarizer")
    graph.add_edge("summarizer", "report_writer")
    graph.add_edge("report_writer", END)

    return graph.compile()


# ─────────────────────────────────────────────
# 5. RUN (CLI mode)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    topic = input("Enter research topic: ").strip()
    if not topic:
        topic = "Latest advancements in RAG pipelines for AI applications"

    app = build_graph()

    initial_state: ResearchState = {
        "topic": topic,
        "search_results": [],
        "summaries": [],
        "final_report": "",
        "logs": []
    }

    print(f"\n{'='*60}")
    print(f"  Starting Multi-Agent Research: {topic}")
    print(f"{'='*60}")

    result = app.invoke(initial_state)

    print(f"\n{'='*60}")
    print("  FINAL REPORT")
    print(f"{'='*60}\n")
    print(result["final_report"])

    print(f"\n{'='*60}")
    print("  AGENT LOGS")
    print(f"{'='*60}")
    for log in result["logs"]:
        print(f"  • {log}")