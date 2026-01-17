from ultralytics import YOLO

model = YOLO("models/yolov8n.pt")

model(
    source="bus.jpg",
    device="cpu",
    imgsz=320,
    show=True
)
