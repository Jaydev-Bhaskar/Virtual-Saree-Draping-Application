import mediapipe as mp
import cv2
import numpy as np
import traceback

try:
    print("Testing MediaPipe initialization...")
    mp_selfie = mp.solutions.selfie_segmentation
    segmentor = mp_selfie.SelfieSegmentation(model_selection=1)
    print("Success! MediaPipe initialized correctly.")
    
    # Test processing
    dummy = np.zeros((100, 100, 3), dtype=np.uint8)
    results = segmentor.process(dummy)
    print("Success! MediaPipe processed dummy image.")
    
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
