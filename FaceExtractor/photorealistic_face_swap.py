import cv2
import numpy as np
import mediapipe as mp
import os

class PhotorealisticFaceSwap:
    def __init__(self):
        """
        Initializes the MediaPipe Face Mesh model.
        This provides 468 3D facial landmarks for immense precision.
        """
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True, 
            max_num_faces=1, 
            refine_landmarks=True, 
            min_detection_confidence=0.5
        )

    def get_landmarks(self, image):
        """Extracts 468 precise facial landmarks."""
        rgb_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_img)
        
        if not results.multi_face_landmarks:
            return None
            
        h, w, _ = image.shape
        landmarks = []
        for lm in results.multi_face_landmarks[0].landmark:
            landmarks.append([int(lm.x * w), int(lm.y * h)])
        return np.array(landmarks, dtype=np.int32)
        
    def get_face_mask(self, image, landmarks):
        """Creates a precise polygon mask using the anatomical contour of the face."""
        # Calculate the convex hull of *all* facial landmarks
        # This naturally traces the exact jawline, brow, and cheek structure (NO CIRCLES!)
        convex_hull = cv2.convexHull(landmarks)
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        cv2.fillConvexPoly(mask, convex_hull, 255)
        
        # Erode mask slightly (by 5-10 pixels) so we don't accidentally grab background edges
        kernel = np.ones((7,7), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
        return mask, convex_hull

    def align_and_swap(self, src_path, dst_path, out_path):
        """
        Aligns the face via Affine Transform, isolates it via exact contour masking, 
        and blends it onto the Saree body.
        """
        src_img = cv2.imread(src_path)
        dst_img = cv2.imread(dst_path)

        if src_img is None or dst_img is None:
            raise ValueError("Error loading source or destination image")

        # 1. Get 468 landmarks for both source (user) & target (saree model)
        src_landmarks = self.get_landmarks(src_img)
        dst_landmarks = self.get_landmarks(dst_img)

        if src_landmarks is None or dst_landmarks is None:
            raise RuntimeError("Could not detect face landmarks in one or both images")

        # 2. Select Alignment Points for Affine Transform
        # Indexes: 33 = Left Eye corner, 263 = Right Eye corner, 1 = Nose tip
        align_indices = [33, 263, 1]
        src_pts = np.float32([src_landmarks[i] for i in align_indices])
        dst_pts = np.float32([dst_landmarks[i] for i in align_indices])

        # 3. Calculate Affine Transformation Matrix
        affine_matrix = cv2.getAffineTransform(src_pts, dst_pts)

        # 4. Warp the Source Image
        # This literally tilts and scales the user's face until the eyes and nose 
        # perfectly overlap the saree model's eyes and nose.
        h_dst, w_dst = dst_img.shape[:2]
        warped_src = cv2.warpAffine(
            src_img, affine_matrix, (w_dst, h_dst), 
            flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101
        )

        # 5. Create Natural Anatomic Face Mask & Warp It
        src_mask, _ = self.get_face_mask(src_img, src_landmarks)
        warped_mask = cv2.warpAffine(src_mask, affine_matrix, (w_dst, h_dst))
        
        # Apply a Gaussian blur to the mask to feather the edges. 
        # This is CRITICAL to avoiding hard, sticker-like boundary lines!
        warped_mask = cv2.GaussianBlur(warped_mask, (15, 15), 10)

        # 6. Find Destination Center
        # Calculate exactly where the face belongs in the destination image
        dst_mask, dst_hull = self.get_face_mask(dst_img, dst_landmarks)
        x, y, w, h = cv2.boundingRect(dst_hull)
        center_target = (x + w // 2, y + h // 2)

        # Expand mask to 3 channels for robust seamlessClone operation
        warped_mask_3c = cv2.cvtColor(warped_mask, cv2.COLOR_GRAY2BGR)

        # 7. Apply OpenCV Seamless Clone (Poisson Blending)
        # NORMAL_CLONE completely replaces texture while matching tone/brightness to surroundings
        try:
            output = cv2.seamlessClone(
                warped_src, 
                dst_img, 
                warped_mask_3c, 
                center_target, 
                cv2.NORMAL_CLONE 
            )
        except Exception as e:
            print(f"Error during seamless clone boundary processing: {e}")
            return False

        # Save Photorealistic Output
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        cv2.imwrite(out_path, output)
        print(f"Success! Photorealistic aligned swap saved to {out_path}")
        return True


if __name__ == "__main__":
    swapper = PhotorealisticFaceSwap()
    print("Anti-Gravity Photorealistic Pipeline Ready.")
    
    # Example execution
    # swapper.align_and_swap("dataset/face.jpg", "dataset/body.jpg", "outputs/photorealistic_final.jpg")
