from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil
import uuid
import os
import cv2

# ---------------- VIDEO FIX ----------------
def reencode_video(src_path, dst_path):
    cap = cv2.VideoCapture(src_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {src_path}")

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0 or fps is None:
        fps = 25

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(dst_path, fourcc, fps, (w, h))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)

    cap.release()
    out.release()

# ---------------- APP ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

# ---------------- STATIC OUTPUTS ----------------
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# ---------------- MODEL ----------------
model = YOLO(os.path.join(BASE_DIR, "backend", "models", "yolov8n.pt"))

# ---------------- API ----------------
@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    print("UPLOAD STARTED")

    video_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{video_id}.mp4")

    # ✅ SAVE UPLOADED FILE (FIXED)
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
        vid_stride=1,
        project=RUNS_BASE,
        name="track",
        save_txt=False,
        save_conf=False
    )

    for _ in results:
        pass

    print("YOLO FINISHED")

    # ---------------- FIND LATEST TRACK RUN ----------------
    track_dirs = [
        os.path.join(RUNS_BASE, d)
        for d in os.listdir(RUNS_BASE)
        if d.startswith("track") and os.path.isdir(os.path.join(RUNS_BASE, d))
    ]

    if not track_dirs:
        return JSONResponse(status_code=500, content={"error": "No tracking output found"})

    latest_run = max(track_dirs, key=os.path.getmtime)

    # ---------------- FIND YOLO OUTPUT VIDEO ----------------
    yolo_video = None
    for root, _, files in os.walk(latest_run):
        for f in files:
            if f.endswith(".mp4") or f.endswith(".avi"):
                yolo_video = os.path.join(root, f)
                break
        if yolo_video:
            break

    if yolo_video is None:
        return JSONResponse(status_code=500, content={"error": "Output video not found"})

    # ---------------- RE-ENCODE (FIXES BLACK VIDEO) ----------------
    output_path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")
    reencode_video(yolo_video, output_path)

    print("RETURNING VIDEO URL")

    return {
        "video_url": f"http://localhost:8000/outputs/{video_id}.mp4"
    }
