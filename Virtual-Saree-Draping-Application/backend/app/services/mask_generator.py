import cv2
import numpy as np
import base64
from PIL import Image, ImageFilter
import io

class SareeMaskGenerator:
    def __init__(self):
        pass

    def _to_hsv(self, bgr):
        return cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    def _detect_skin(self, bgr):
        """
        Detects skin pixels using a combination of HSV and YCrCb color spaces.
        """
        hsv = self._to_hsv(bgr)
        ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
        
        lower_hsv = np.array([0, 20, 70], dtype=np.uint8)
        upper_hsv = np.array([25, 255, 255], dtype=np.uint8)
        mask_hsv = cv2.inRange(hsv, lower_hsv, upper_hsv)
        
        lower_ycrcb = np.array([0, 133, 77], dtype=np.uint8)
        upper_ycrcb = np.array([255, 173, 127], dtype=np.uint8)
        mask_ycrcb = cv2.inRange(ycrcb, lower_ycrcb, upper_ycrcb)
        
        skin = cv2.bitwise_and(mask_hsv, mask_ycrcb)
        kernel = np.ones((5, 5), np.uint8)
        skin = cv2.dilate(skin, kernel, iterations=1)
        return skin

    def generate_mask(self, image_path, face_box=None):
        """
        Generates a saree mask using a surgical multi-seed GrabCut strategy.
        Excludes edges, face, and skin regions with high precision.
        """
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        h, w = img.shape[:2]
        
        # 1. GrabCut Strategy
        # GC_BGD=0, GC_FGD=1, GC_PR_BGD=2, GC_PR_FGD=3
        gc_mask = np.full((h, w), cv2.GC_BGD, dtype=np.uint8) # Default everything to BGD
        
        # Define person zone (the rect where we actually care)
        # We'll use a rect that is strictly narrower than the full image
        rect_x1, rect_y1 = int(w * 0.12), int(h * 0.05)
        rect_x2, rect_y2 = int(w * 0.88), int(h * 0.95)
        rect_w, rect_h = rect_x2 - rect_x1, rect_y2 - rect_y1
        
        # Initialize internal zone as Probable Background
        gc_mask[rect_y1:rect_y2, rect_x1:rect_x2] = cv2.GC_PR_BGD
        
        # Initialize Face Box as Sure Foreground
        if face_box:
            fx, fy, fw, fh = face_box
            # Ensure face box is within image bounds
            fx1, fy1 = max(0, fx), max(0, fy)
            fx2, fy2 = min(w, fx + fw), min(h, fy + fh)
            gc_mask[fy1:fy2, fx1:fx2] = cv2.GC_FGD
            
            # Initialize a tapered center column as Probable Foreground
            # This follows the typical body silhouette
            for y_line in range(fy2, rect_y2):
                # Calculate tapering: 1.2x face width at chest, widening to 2.2x down below
                ratio = (y_line - fy2) / (rect_y2 - fy2)
                taper = int(fw * (0.8 + ratio * 1.2))
                tx1 = max(rect_x1, fx + fw // 2 - taper)
                tx2 = min(rect_x2, fx + fw // 2 + taper)
                gc_mask[y_line, tx1:tx2] = cv2.GC_PR_FGD

        # 2. Run GrabCut
        fgModel = np.zeros((1, 65), np.float64)
        bgModel = np.zeros((1, 65), np.float64)
        
        try:
            # We use INIT_WITH_MASK because we've provided specific seeds
            cv2.grabCut(img, gc_mask, (rect_x1, rect_y1, rect_w, rect_h), bgModel, fgModel, 3, cv2.GC_INIT_WITH_MASK)
            # Create silhouette: GC_FGD and GC_PR_FGD are mask values 1 and 3
            person_silhouette = np.where((gc_mask == 1) | (gc_mask == 3), 255, 0).astype('uint8')
        except Exception:
            # Fallback
            person_silhouette = np.zeros((h, w), np.uint8)
            person_silhouette[rect_y1:rect_y2, rect_x1:rect_x2] = 255

        # 3. Detect skin & Face exclusion
        skin = self._detect_skin(img)
        saree_mask = cv2.bitwise_and(person_silhouette, cv2.bitwise_not(skin))
        
        if face_box:
            fx, fy, fw, fh = face_box
            padx, pady = int(fw * 0.3), int(fh * 0.4)
            saree_mask[max(0, fy-pady):min(h, fy+fh+pady), max(0, fx-padx):min(w, fx+fw+padx)] = 0
            
        # 4. Final Pruning
        prune_y = (fy + fh) if face_box else int(h * 0.2)
        saree_mask[0:prune_y, :] = 0
        
        # 5. Surgical Post-Processing
        # Use a Closing morph to fill fabric gaps
        kernel = np.ones((11, 11), np.uint8)
        saree_mask = cv2.morphologyEx(saree_mask, cv2.MORPH_CLOSE, kernel)
        
        # ERODE the edges slightly to prevent background bleeding if the silhouette was too loose
        erode_kernel = np.ones((5, 5), np.uint8)
        saree_mask = cv2.erode(saree_mask, erode_kernel, iterations=1)
        
        # Blur to soften
        saree_mask = cv2.GaussianBlur(saree_mask, (15, 15), 0)
        
        return saree_mask

    def mask_to_base64(self, mask):
        """Converts the numpy mask to a base64 encoded PNG string."""
        if mask is None:
            return None
        _, buffer = cv2.imencode('.png', mask)
        b64_string = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{b64_string}"

# Singleton
saree_mask_generator = SareeMaskGenerator()
