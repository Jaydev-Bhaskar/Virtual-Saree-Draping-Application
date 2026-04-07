import cv2
import numpy as np

class Preprocessor:
    def __init__(self):
        # We bypass local MediaPipe/DensePose computation because the HuggingFace
        # IDM-VTON space automatically performs DensePose internally.
        pass

    def generate_pose_and_mask(self, image_path):
        """
        Step 1: Extract body landmarks & body mask
        Returns the original image, a dummy pose map, and dummy mask.
        (IDM-VTON HuggingFace handles this step Server-Side natively)
        """
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image at {image_path}")
            
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        pose_map = np.zeros_like(image)
        return image, pose_map, mask

    def prepare_saree(self, saree_img_path):
        """
        Step 2: Saree Preparation
        """
        saree_img = cv2.imread(saree_img_path)
        processed_saree = saree_img.copy()
        # Apply slight Gaussian blur to smooth out flat artifacts
        processed_saree = cv2.GaussianBlur(processed_saree, (3, 3), 0)
        return processed_saree
