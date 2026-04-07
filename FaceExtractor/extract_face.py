import cv2
import os

class FaceExtractor:
    def __init__(self, output_size=(256, 256)):
        """
        Initialize the Face Extractor.
        Args:
            output_size (tuple): Desired (width, height) of the cropped face.
        """
        self.output_size = output_size
        
        # Load the pre-trained Haar Cascade model for face detection directly from cv2
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        if self.face_cascade.empty():
            raise Exception("Failed to load Haar cascade model. Check OpenCV installation.")

    def extract_face(self, image_path, output_dir, draw_bbox=False):
        """
        Detects, crops, and saves the most prominent face from an image.
        
        Args:
            image_path (str): Path to input image
            output_dir (str): Directory to save processed face
            draw_bbox (bool): If True, saves a debug image with a bounding box
            
        Returns:
            dict: Coordinates of the face (x, y, w, h) or None if no face found.
        """
        if not os.path.exists(image_path):
            print(f"Error: Input image not found at {image_path}")
            return None

        os.makedirs(output_dir, exist_ok=True)
        
        # 1. Read the image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Unable to read image {image_path}")
            return None
            
        # 2. Convert to grayscale (Haar Cascade works best on grayscale)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. Detect faces
        # scaleFactor determines how much the image size is reduced at each scale
        # minNeighbors determines how many neighbors a candidate rectangle must have
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(50, 50)
        )
        
        if len(faces) == 0:
            print("Error: No face detected in the image.")
            return None
            
        # 4. Handle multiple faces (Find the largest face by area width * height)
        prominent_face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = prominent_face
        
        # 5. Crop the face region
        cropped_face = img[y:y+h, x:x+w]
        
        # 6. Resize output to fixed size
        resized_face = cv2.resize(cropped_face, self.output_size)
        
        # 7. Save the cropped face
        base_name = os.path.basename(image_path)
        name, ext = os.path.splitext(base_name)
        output_path = os.path.join(output_dir, f"{name}_face{ext}")
        
        cv2.imwrite(output_path, resized_face)
        print(f"Successfully saved cropped face to: {output_path}")
        
        # Optional: Save a debug image showing the bounding box
        if draw_bbox:
            debug_img = img.copy()
            cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 255, 0), 3)
            debug_path = os.path.join(output_dir, f"{name}_bbox{ext}")
            cv2.imwrite(debug_path, debug_img)
            print(f"Saved debug bounding-box image to: {debug_path}")
            
        return {"x": x, "y": y, "width": w, "height": h, "path": output_path}


if __name__ == "__main__":
    # Define paths
    INPUT_DIR = "dataset"
    OUTPUT_DIR = "outputs"
    
    # Create test input file if it does not exist
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=== Anti-Gravity Face Extractor Initialization ===")
    
    extractor = FaceExtractor(output_size=(256, 256))
    
    # Process all images in the dataset folder
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    images_found = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(valid_extensions)]
    
    if not images_found:
        print(f"No images found in '{INPUT_DIR}'.")
        print(f"Please drop some images into the dataset folder and try again.")
    else:
        for filename in images_found:
            print(f"\nProcessing: {filename}")
            filepath = os.path.join(INPUT_DIR, filename)
            result = extractor.extract_face(
                image_path=filepath, 
                output_dir=OUTPUT_DIR, 
                draw_bbox=True # Enable debug box
            )
            
            if result:
                print(f"Detected face coordinates: X:{result['x']}, Y:{result['y']}, W:{result['width']}, H:{result['height']}")
