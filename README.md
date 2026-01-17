# Full Stack Object Detection App

This project is a **full‑stack application** with a **Python backend** and a **React (Vite) frontend**. The backend handles object detection and tracking, while the frontend provides a user interface to interact with the system.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── data/           # Input data (ignored by git)
│   ├── models/         # ML / detection models
│   ├── outputs/        # Generated results (ignored by git)
│   ├── runs/           # Experiment runs (ignored by git)
│   ├── uploads/        # Uploaded files (ignored by git)
│   ├── detect.py       # Object detection logic
│   ├── track.py        # Object tracking logic
│   ├── train.py        # Model training script
│   ├── main.py         # Backend entry point
│   ├── requirements.txt
│   └── video.mp4       # Sample video
│
├── react-ui/            # React frontend
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## ⚙️ Backend Setup (Python)

### 1. Navigate to backend

```bash
cd backend
```

### 2. Create virtual environment (optional but recommended)

```bash
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run backend

```bash
python main.py
```

---

## 🌐 Frontend Setup (React + Vite)

### 1. Navigate to frontend

```bash
cd react-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

The app will run at:

```
http://localhost:5173
```

---

## 🚀 Features

* Object detection
* Object tracking
* Video/image processing
* React UI with Tailwind CSS
* Vite for fast development

---

## 🧪 Notes

* Generated files like **uploads, outputs, runs, and videos** are ignored using `.gitignore`.
* Update `requirements.txt` if new Python libraries are added.
* Update `package.json` for frontend dependencies.

---

## 📌 Future Improvements

* API integration between backend and frontend
* Authentication
* Model optimization
* Deployment setup

---

## 📄 License

This project is for educational and deve
