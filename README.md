# 🤖 AI Agent Platform

A multi-tenant AI agent platform that allows users to create custom chatbots that answer questions based on uploaded documents and connected databases using Retrieval-Augmented Generation (RAG) and a local LLM (LLaMA 3 via Ollama).

## 🚀 Features

- 📄 Upload PDFs, Word docs, TXT, Markdown, CSV, Excel files
- 🧠 Document & Database-based Q&A (RAG)
- 🛠 Custom prompt/instructions per agent
- 🔐 JWT Auth with Role-based access (Admin/User)
- 🧠 Local LLM inference via Ollama (LLaMA 3)
- 📊 Usage analytics dashboard
- 🌐 Embed agents as widgets on any site
- 🔁 Multi-agent & multi-tenant support

## 🧱 Tech Stack

| Layer        | Technology                       |
|--------------|----------------------------------|
| Frontend     | React + Vite + Tailwind CSS      |
| State Mgmt   | React Query                      |
| Animations   | Framer Motion                    |
| Backend      | FastAPI + LangChain              |
| Auth         | JWT + Role-based access          |
| Vector DB    | Chroma                           |
| LLM          | Ollama (LLaMA 3)                 |
| RDBMS        | PostgreSQL                       |
| Container    | Docker + Docker Compose          |

---

## ⚙️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/ai-agent-platform.git
cd ai-agent-platform
