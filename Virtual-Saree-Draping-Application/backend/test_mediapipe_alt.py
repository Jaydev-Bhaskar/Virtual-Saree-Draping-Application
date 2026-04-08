try:
    print("Testing alternative MediaPipe import...")
    from mediapipe.python.solutions import selfie_segmentation as mp_selfie
    segmentor = mp_selfie.SelfieSegmentation(model_selection=1)
    print("Success! MediaPipe initialized with alternative import.")
except Exception as e:
    import traceback
    traceback.print_exc()
