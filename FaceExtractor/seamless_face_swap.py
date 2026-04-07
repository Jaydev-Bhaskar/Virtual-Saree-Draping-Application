import cv2
import numpy as np
import os

class AdvancedFaceSwap:
    def __init__(self):
        """
        Initializes the Advanced Face Swapping module using OpenCV.
        """
        # Load Haar Cascade
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        if self.face_cascade.empty():
            print("Failed to load cascade")

    def extract_face_box(self, img):
        """Detects the largest face in the image and returns its bounding box."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
        if len(faces) == 0:
            return None
        return max(faces, key=lambda f: f[2] * f[3])

    def swap_face(self, user_img_path, target_saree_path, output_path):
        """
        Seamlessly clones the user's face onto the target Saree model,
        completely erasing the original face parameters to prevent ghosting.
        """
        # 1. Read images
        user_img = cv2.imread(user_img_path)
        saree_img = cv2.imread(target_saree_path)

        if user_img is None or saree_img is None:
            print("Error loading one of the images.")
            return False

        # 2. Detect Faces
        user_face = self.extract_face_box(user_img)
        saree_face = self.extract_face_box(saree_img)

        if not user_face or not saree_face:
            print("Face detection failed in one of the images.")
            return False

        ux, uy, uw, uh = user_face
        tx, ty, tw, th = saree_face

        # 3. Crop User Face & Resize it to matching scale
        cropped_user_face = user_img[uy:uy+uh, ux:ux+uw]
        resized_user_face = cv2.resize(cropped_user_face, (tw, th))

        # 4. Generate Solid Mask
        # Creating a solid white elliptical mask to STRICTLY define the extraction zone
        # This replaces the background pixels directly to avoid transparency ghosting.
        mask = np.zeros_like(resized_user_face)
        center = (tw // 2, th // 2)
        axes = (int(tw // 2.2), int(th // 1.8))
        cv2.ellipse(mask, center, axes, 0, 0, 360, (255, 255, 255), -1)

        # 5. Identify Target Center coordinates
        target_center = (tx + tw // 2, ty + th // 2)

        # 6. Apply Seamless Cloning
        # cv2.NORMAL_CLONE uses Poisson blending to match lighting while totally 
        # overwriting the underlying structure (preventing double-face overlap!)
        try:
            blended_result = cv2.seamlessClone(
                resized_user_face, 
                saree_img, 
                mask, 
                target_center, 
                cv2.NORMAL_CLONE
            )
        except Exception as e:
            print(f"Seamless cloning failed: {e}")
            return False

        # Save output cleanly
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cv2.imwrite(output_path, blended_result)
        print(f"Success! Photorealistic face swap saved to: {output_path}")
        return True

if __name__ == "__main__":
    swapper = AdvancedFaceSwap()
    print("Anti-Gravity Seamless Face Clone Engine Ready.")
    # Example Usage:
    # swapper.swap_face("dataset/customer.jpg", "dataset/saree_model.jpg", "outputs/final_tryon.jpg")
