from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil
import uuid
import os
import subprocess

# ---------------- APP ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "backend", "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "backend", "outputs")
RUNS_BASE = os.path.join(BASE_DIR, "backend", "runs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- STATIC FILES ----------------
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# ---------------- MODEL ----------------
model = YOLO(os.path.join(BASE_DIR, "backend", "models", "yolov8n.pt"))
FFMPEG_PATH = r"C:\Softwares\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe"
# ---------------- FFmpeg RE-ENCODE ----------------
def reencode_video_ffmpeg(src_path: str, dst_path: str) -> bool:
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", src_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        dst_path
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if result.returncode != 0:
        print("❌ FFmpeg failed")
        print(result.stderr)
        return False

    return True

# ---------------- API ----------------
@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    print("UPLOAD STARTED")

    video_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{video_id}.mp4")

    # Save uploaded file
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("FILE SAVED")
    print("RUNNING YOLO...")

    results = model.track(
        source=input_path,
        tracker="ultralytics/cfg/trackers/bytetrack.yaml",
        device="cpu",
        save=True,
        stream=True,
        project=RUNS_BASE,
        name="track",
        save_txt=False,
        save_conf=False
    )

    # Consume generator (required)
    for _ in results:
        pass

    print("YOLO FINISHED")

    # Find latest run
    track_dirs = [
        os.path.join(RUNS_BASE, d)
        for d in os.listdir(RUNS_BASE)
        if d.startswith("track") and os.path.isdir(os.path.join(RUNS_BASE, d))
    ]

    if not track_dirs:
        return JSONResponse(status_code=500, content={"error": "No tracking output found"})

    latest_run = max(track_dirs, key=os.path.getmtime)

    # Find YOLO output video
    yolo_video = None
    for root, _, files in os.walk(latest_run):
        for f in files:
            if f.endswith(".mp4") or f.endswith(".avi"):
                yolo_video = os.path.join(root, f)
                break
        if yolo_video:
            break

    if yolo_video is None:
        return JSONResponse(status_code=500, content={"error": "YOLO output video not found"})

    # Re-encode with FFmpeg (CRITICAL)
    output_path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")
    ok = reencode_video_ffmpeg(yolo_video, output_path)

    if not ok:
        return JSONResponse(
            status_code=500,
            content={"error": "FFmpeg re-encoding failed"}
        )

    print("RETURNING VIDEO URL")

    return {
        "video_url": f"http://localhost:8000/outputs/{video_id}.mp4"
    }
