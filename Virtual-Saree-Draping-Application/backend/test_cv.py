import cv2
import numpy as np
import os

print(f"OpenCV Version: {cv2.__version__}")

# Test face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
if face_cascade.empty():
    print("Error: Face cascade empty!")
else:
    print("Face cascade loaded!")

# Test eye cascade
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
if eye_cascade.empty():
    print("Error: Eye cascade empty!")
else:
    print("Eye cascade loaded!")

# Test image reading (just a dummy)
dummy = np.zeros((100, 100, 3), dtype=np.uint8)
success, encoded = cv2.imencode(".jpg", dummy)
if success:
    print("CV2 Imencode works!")
