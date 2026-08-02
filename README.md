# LocalMind Chat

A privacy-focused, full-stack chat application for talking to a locally hosted language model. LocalMind Chat streams responses from Ollama, stores conversation history in MongoDB, and provides a clean React interface for managing multiple chats.

## Features

- Stream AI responses as they are generated
- Run inference locally through Ollama
- Create, rename, search, and delete chat sessions
- Preserve conversation history in MongoDB
- Generate short chat titles from the first message
- Responsive, collapsible conversation sidebar
- Toast notifications for user feedback
- PDF export interface (backend endpoint still needs to be implemented)

## Tech stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend:** FastAPI, Python 3.12+, Uvicorn
- **AI:** Ollama through its OpenAI-compatible API
- **Database:** MongoDB with Motor

## Architecture

```text
React client (:3000)
        |
        v
FastAPI server (:8000)
      /   \
     v     v
Ollama   MongoDB
(:11434)  chat sessions and messages
```

The frontend sends chat requests to FastAPI. The backend loads the selected session's history from MongoDB, passes it to Ollama, streams the generated response to the browser, and saves the completed exchange.

## Prerequisites

Install the following before starting:

- Node.js and npm
- Python 3.12 or newer
- [Poetry](https://python-poetry.org/) for backend dependencies
- MongoDB, running locally or available through a connection URI
- [Ollama](https://ollama.com/)

The backend currently uses the `llama3.2` model. Download it before launching the application:

```bash
ollama pull llama3.2
```

## Installation

Clone the repository and enter its directory:

```bash
git clone <repository-url>
cd chat-with-ai
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Install the backend dependencies:

```bash
cd backend
poetry install
cd ..
```

## Configuration

Create `backend/.env` and provide your MongoDB connection details:

```dotenv
MONGO_URI=mongodb://localhost:27017
MONGO_DB=localmind_chat
```

The application currently expects these local services and ports:

| Service | Address |
| --- | --- |
| React frontend | `http://localhost:3000` |
| FastAPI backend | `http://localhost:8000` |
| Ollama API | `http://localhost:11434/v1` |

## Running the application

Start MongoDB and Ollama first. For example:

```bash
ollama serve
```

Then start the backend from a new terminal:

```bash
cd backend
poetry run uvicorn main:app --reload
```

Start the frontend from another terminal:

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) and select **AI chat**.

Interactive backend documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/chat` | Send a message and stream the model response |
| `POST` | `/chat-simple` | Send a message without token-by-token streaming |
| `POST` | `/chat/name` | Generate and save a title for a conversation |
| `GET` | `/chat/sessions` | List chat sessions |
| `POST` | `/chat/sessions` | Create a chat session |
| `PUT` | `/chat/sessions/{session_id}` | Update a session title or timestamp |
| `DELETE` | `/chat/sessions/{session_id}` | Delete a session and its messages |
| `GET` | `/chat/session/{session_id}/messages` | Retrieve a session's messages |

## Project structure

```text
.
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # MongoDB connection
│   ├── models/                 # Request and database models
│   └── routes/                 # Chat and session endpoints
├── frontend/
│   └── src/
│       ├── Components/         # Chat interface and controls
│       ├── contexts/           # Shared React state
│       ├── hooks/              # Reusable React hooks
│       ├── services/           # Backend API calls
│       ├── types/              # TypeScript types
│       └── utils/              # Chat helpers
├── bkrun.sh                    # Backend helper script
└── frrun.sh                    # Frontend helper script
```

## Known limitations

- API URLs, ports, the Ollama model, and the allowed CORS origin are currently hard-coded for local development.
- The PDF export button calls `/export-pdf/{session_id}`, but that endpoint is not implemented in the backend yet.
- The application does not currently include authentication, automated tests, or deployment configuration.

## License

No license has been added yet. Add a license before redistributing or accepting external contributions.
