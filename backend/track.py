from ultralytics import YOLO

model = YOLO("models/yolov8n.pt")

model.track(
    source="video.mp4",
    tracker="trackers/bytetrack.yaml",
    device="cpu",
    imgsz=320,
    show=True
)
