import sys
import os

# 1. Add FaceExtractor folder to path 
extractor_path = r"c:\Users\HP\Desktop\Avinython\FaceExtractor"
if extractor_path not in sys.path:
    sys.path.append(extractor_path)

try:
    import mediapipe as mp
    print(f"Mediapipe attributes: {dir(mp)}")
    if hasattr(mp, 'solutions'):
        print("Solutions found!")
    else:
        print("Solutions NOT found in mediapipe module root.")
        
    import mediapipe.python.solutions.face_mesh as fm
    print("Directly imported face_mesh!")
    
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
