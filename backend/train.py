""" from ultralytics import YOLO

# Load YOLOv8 Nano model
model = YOLO("yolov8n.pt")

# Train on COCO (CPU only)
model.train(
    data="coco.yaml",
    epochs=1,          # keep low for CPU
    imgsz=320,
    batch=4,
    device="cpu",
    workers=2
)
 """