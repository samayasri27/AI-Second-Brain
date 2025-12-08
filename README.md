# PersonalMind - AI Second Brain

An intelligent personal knowledge management system that combines PARA organization, GTD task management, and AI-powered insights to help you remember, organize, and act on everything important in your life.

## 🌟 Features

- **Smart Document Management**: Upload PDFs, text files, and markdown - automatically classified using PARA methodology
- **AI-Powered Chat**: Ask questions about your documents using RAG (Retrieval Augmented Generation)
- **Automatic Task Extraction**: Tasks and deadlines are automatically extracted from your documents
- **Knowledge Graph**: Visualize connections between your topics and documents
- **AI Insights**: Get weekly reflections, suggestions, and pattern analysis
- **Semantic Search**: Find information using natural language queries

## 🏗️ Architecture

```
PersonalMind/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── agents/    # LangGraph agents (router, search, tasks)
│   │   ├── db/        # Database models and connections
│   │   ├── services/  # Business logic
│   │   ├── schemas/   # Pydantic models
│   │   └── utils/     # Helper functions
│   ├── .env           # Environment variables
│   └── requirements.txt
│
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **LangChain + LangGraph**: Agent orchestration
- **Groq**: LLM provider (Llama 3.1)
- **ChromaDB**: Vector database for embeddings
- **SQLite**: Relational database (upgradeable to PostgreSQL)
- **APScheduler**: Task reminders and scheduling

### Frontend
- **React + TypeScript**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Shadcn/ui**: Component library

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (get one at https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/samayasri27/AI-Second-brain.git
cd AI-Second-brain
```

### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start backend
uvicorn backend.main:app --reload --port 8000
```

Backend will be available at http://localhost:8000

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:8000

# Start frontend
npm run dev
```

Frontend will be available at http://localhost:5173

## 📖 Usage

### Upload Documents
1. Navigate to "Knowledge Space" in the UI
2. Click "Upload Document"
3. Select PDF, TXT, or MD files
4. Documents are automatically:
   - Classified into PARA categories (Projects, Areas, Resources, Archives)
   - Analyzed for topics
   - Chunked and embedded for semantic search
   - Scanned for tasks and deadlines

### Chat with Your Knowledge
1. Go to "BrainChat"
2. Ask questions about your documents
3. Get AI-generated answers with source citations

### View Tasks
1. Navigate to "Tasks"
2. See all extracted tasks organized by:
   - Today
   - Upcoming
   - Overdue
   - Completed
3. Mark tasks as complete

### Get AI Insights
1. Go to "Insights"
2. View personalized:
   - Weekly reflections
   - Actionable suggestions
   - Learning patterns
   - Achievement milestones

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL=sqlite:///./personalmind.db
CHROMA_PERSIST_DIR=./chroma_data
COLLECTION_NAME=pm_chunks
GROQ_API_KEY=your_groq_api_key_here
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:8000
```

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy

**Note**: Render free tier does not support persistent storage. Upgrade to paid plan for data persistence.

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints
- `POST /upload_doc` - Upload and process documents
- `POST /ask` - Chat with your knowledge base
- `GET /tasks` - Get all tasks
- `PATCH /task/{id}` - Update task status
- `GET /insights` - Get AI-generated insights
- `GET /documents` - List all documents
- `GET /dashboard/stats` - Get dashboard statistics

## 🧠 How It Works

### PARA Organization
Documents are automatically classified into:
- **Projects**: Time-bound goals with deadlines
- **Areas**: Ongoing responsibilities
- **Resources**: Reference materials
- **Archives**: Completed items

### RAG (Retrieval Augmented Generation)
1. Documents are chunked and embedded using sentence transformers
2. User questions are embedded and matched against document chunks
3. Relevant chunks are retrieved from ChromaDB
4. Groq LLM generates answers using retrieved context

### Task Extraction
- AI analyzes document content for action items
- Extracts task descriptions and due dates
- Stores in database for tracking
- Sends reminders for upcoming deadlines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Powered by [Groq](https://groq.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Vector search by [ChromaDB](https://www.trychroma.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for better knowledge management**
