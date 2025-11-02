# JourneyAI

AI-assisted travel planning built with a lightweight Express API, MongoDB, and a React + Vite front-end. Gemini generates day-by-day itineraries, while the UI makes it easy to explore trips, tweak plans, and keep everything in one place.

---

## ✨ Highlights

- **One-click planning** – Send basic trip details to Gemini and receive a structured itinerary.
- **Trip workspace** – View, regenerate, and manage itineraries with a clean React experience.
- **Weather context** – Pull current conditions and forecasts to fine-tune plans.
- **Mongo-backed storage** – Persist trips, itineraries, and AI responses for later refinement.

---

## 🛠 Tech Stack

| Layer      | Tools |
|------------|-------|
| Frontend   | React 19, Vite, Tailwind CSS, React Router |
| Backend    | Node.js 18+, Express, Axios |
| Database   | MongoDB + Mongoose |
| AI         | Google Gemini (via `@google/generative-ai`) |
| Auth       | JWT, bcryptjs |

---

## 🚀 Quick Start

```bash
git clone https://github.com/HimankMahani/JourneyAI.git
cd JourneyAI
npm run install:all        # installs backend + frontend deps

# set up backend/.env
cat <<'EOF' > backend/.env
MONGODB_URI=replace_me
JWT_SECRET=replace_me
GEMINI_API_KEY=replace_me
OPENWEATHER_API_KEY=replace_me
EOF

npm run dev               # runs backend (5050) + frontend (5173)
```

Open http://localhost:5173 to try it out. The dev script keeps both servers in sync.

---

## 📂 Project Layout

```
JourneyAI/
├── backend/            # Express API, MongoDB models, Gemini services
├── frontend/           # React SPA (Vite + Tailwind)
├── package.json        # Root scripts for dev + installs
└── README.md           # You are here
```

---

## 🔧 Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend + frontend with hot reload |
| `npm run dev:backend` | Only start the API server |
| `npm run dev:frontend` | Only start the Vite dev server |
| `npm run build:frontend` | Create a production build of the React app |

---

## ✅ Environment Notes

- Gemini, MongoDB, and OpenWeather keys are mandatory for full functionality.
- The backend listens on port `5050` by default; update `VITE_API_BASE_URL` in `frontend/.env` if needed.
- Authentication uses JWT stored in localStorage; clear it to reset sessions.

---

## 🤝 Contributing

Fork the repo, create a feature branch, and open a PR. Issues and suggestions are always welcome.

---

Made with ☕ and curiosity.
