import cv2
import numpy as np
import os

class PhotorealisticFaceSwap:
    def __init__(self):
        """
        Initializes the robust OpenCV Cascade Classifiers.
        This provides a highly compatible and stable face/eye detection system.
        """
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    def find_landmarks_cascade(self, image):
        """Extracts key landmarks (eyes) using Haar Cascades."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None, None
            
        # Get the largest face
        f_x, f_y, f_w, f_h = max(faces, key=lambda f: f[2] * f[3])
        face_roi_gray = gray[f_y:f_y+f_h, f_x:f_x+f_w]
        
        # Detect eyes within the face ROI
        eyes = self.eye_cascade.detectMultiScale(face_roi_gray)
        if len(eyes) < 2:
            # Fallback: estimate eye positions if not detected
            # Typically eyes are at 1/3 and 2/3 width, 1/3 height of the face box
            left_eye = [int(f_x + f_w * 0.3), int(f_y + f_h * 0.35)]
            right_eye = [int(f_x + f_w * 0.7), int(f_y + f_h * 0.35)]
        else:
            # Sort eyes by x coordinate
            eyes = sorted(eyes, key=lambda e: e[0])
            left_eye = [f_x + eyes[0][0] + eyes[0][2]//2, f_y + eyes[0][1] + eyes[0][3]//2]
            right_eye = [f_x + eyes[1][0] + eyes[1][2]//2, f_y + eyes[1][1] + eyes[1][3]//2]
            
        # Estimated nose tip (midpoint between eyes, shifted down)
        mid_x = (left_eye[0] + right_eye[0]) // 2
        mid_y = (left_eye[1] + right_eye[1]) // 2
        dist = np.sqrt((left_eye[0]-right_eye[0])**2 + (left_eye[1]-right_eye[1])**2)
        nose = [mid_x, int(mid_y + dist * 0.4)]
        
        # Return landmarks and face bounding box
        landmarks = np.float32([left_eye, right_eye, nose])
        return landmarks, (f_x, f_y, f_w, f_h)
        
    def get_face_mask(self, image, face_bbox):
        """Creates an elliptical/anatomic face mask."""
        x, y, w, h = face_bbox
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        
        # Draw an filled ellipse that covers the face region
        # This provides a smooth, natural-looking boundary for the blend
        center = (x + w // 2, y + h // 2)
        axes = (int(w * 0.42), int(h * 0.55))
        cv2.ellipse(mask, center, axes, 0, 0, 360, 255, -1)
        
        # Further feather the mask edges
        mask = cv2.GaussianBlur(mask, (31, 31), 15)
        return mask

    def align_and_swap(self, src_path, dst_path, out_path):
        """
        Robustly aligns and swaps faces using Affine Transform and Seamless Cloning.
        """
        src_img = cv2.imread(src_path)
        dst_img = cv2.imread(dst_path)

        if src_img is None or dst_img is None:
            raise ValueError("Error loading source or destination image")

        # 1. Get landmarks and face boxes
        src_lms, src_box = self.find_landmarks_cascade(src_img)
        dst_lms, dst_box = self.find_landmarks_cascade(dst_img)

        if src_lms is None or dst_lms is None:
            raise RuntimeError("Face detection failed! Ensure both images have clear front-facing faces.")

        # 2. Calculate Affine Transformation Matrix
        affine_matrix = cv2.getAffineTransform(src_lms, dst_lms)

        # 3. Warp the Source Image
        h_dst, w_dst = dst_img.shape[:2]
        warped_src = cv2.warpAffine(
            src_img, affine_matrix, (w_dst, h_dst), 
            flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101
        )

        # 4. Create and Warp Face Mask
        src_mask = self.get_face_mask(src_img, src_box)
        warped_mask = cv2.warpAffine(src_mask, affine_matrix, (w_dst, h_dst))
        warped_mask = cv2.GaussianBlur(warped_mask, (15, 15), 10) # Feather edges

        # 5. Calculate Center for Seamless Clone
        dx, dy, dw, dh = dst_box
        center_target = (dx + dw // 2, dy + dh // 2)

        # 6. Apply OpenCV Seamless Clone (Poisson Blending)
        try:
            # We use a 3-channel version of the mask for the operation
            warped_mask_3c = cv2.cvtColor(warped_mask, cv2.COLOR_GRAY2BGR)
            
            output = cv2.seamlessClone(
                warped_src, 
                dst_img, 
                warped_mask_3c, 
                center_target, 
                cv2.NORMAL_CLONE 
            )
        except Exception as e:
            print(f"Blending failure: {e}")
            return False, None

        # 7. Save and Return
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        cv2.imwrite(out_path, output)
        print(f"Swap result saved to: {out_path}")
        return True, dst_box


if __name__ == "__main__":
    swapper = PhotorealisticFaceSwap()
    print("Anti-Gravity Robust CV2 Swapper Ready.")
