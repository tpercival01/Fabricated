# Fabricated (Formerly Infinite Detective)

**Live Demo:** https://fabricated-iho0d14x4-tpercival01s-projects.vercel.app/

**Backend Repository:** https://github.com/tpercival01/Fabricated-AI-Engine

## Project Overview
Fabricated is a procedural true-crime mystery game built to demonstrate advanced LLM orchestration, complex state management, and full-stack system architecture. 

Instead of static, pre-written puzzles, the game uses an AI generation pipeline to construct a completely unique murder mystery on the fly. The player acts as a detective, using a digital corkboard to map out suspects, connect clues with red strings, and ultimately submit a theory to an "AI Judge" for evaluation.

## The Architecture
This project is split into a separated frontend and backend architecture to enforce clean data boundaries and prevent client-side cheating.

### The Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS, React Flow, TypeScript
* **Backend:** Python 3, FastAPI, Supabase (PostgreSQL), `slowapi` (Rate Limiting)
* **AI Pipeline:** Groq API running `llama-3.3-70b-versatile`

### The Data Flow (Generation)
1. The user requests a new case with a custom **Theme** and **Difficulty**.
2. The FastAPI backend triggers a sequential LLM chain:
   * **Step 1:** Generates the `CoreTruth` (The victim, the actual killer, the true motive, and the alibi flaw).
   * **Step 2:** Generates the `SuspectList` and `EvidenceBoard` based strictly on the CoreTruth.
3. The complete case is saved to a Supabase PostgreSQL database.
4. A sanitizer function strips the `CoreTruth` from the payload before sending it to the Next.js client, making it impossible for the user to cheat by inspecting network requests.

### The Data Flow (Evaluation)
1. The user drags red strings (React Flow edges) between Suspects and Clues.
2. Upon submitting an accusation, the frontend bundles the chosen Suspect, the connected Clues, and the player's typed theory.
3. The backend retrieves the sanitized `CoreTruth` from the database and injects it alongside the player's theory into an "AI Judge" prompt.
4. The Judge evaluates the logic and returns a definitive verdict and in-character feedback.

## Key Features
* **Infinite Procedural Generation:** No two cases are exactly alike.
* **Interactive Node Canvas:** Built with React Flow, allowing physics-based drag-and-drop evidence linking.
* **Client-Side Persistence:** The React Flow board state and a "Trophy Cabinet" of past cases are actively synced to `localStorage`.
* **Abuse Prevention:** IP-based rate limiting via FastAPI and prompt-injection fallbacks.

## Local Setup

### Frontend Setup
1. Clone this repository.
2. Run `npm install`
3. Create a `.env.local` file in the root directory:
   `NEXT_PUBLIC_API_URL=http://localhost:8000` (or your live backend URL)
4. Run `npm run dev`

### Backend Setup
Please refer to the [Backend Repository](link) for Python environment instructions, Supabase table schemas, and Groq API configurations.
