import os
import cv2
import uuid

from .preprocess import Preprocessor
from .draping_model import IDM_VTON_Draper
from .postprocess import PostProcessor

class AdvancedSareeVTONPipeline:
    def __init__(self, use_remote_diffusion=True):
        print("Initializing Advanced Saree VTON Pipeline...")
        self.preprocessor = Preprocessor()
        self.draper = IDM_VTON_Draper(use_remote=use_remote_diffusion)
        self.postprocessor = PostProcessor()
        print("Pipeline Ready.")

    def run(self, person_img_path, saree_img_path, output_path):
        """
        Executes the 5-step Highly Realistic Virtual Saree Draping Pipeline.
        """
        print("[Pipeline] 1 & 2. Preprocessing & Saree Prep...")
        # Step 1: Detect Pose & Masks
        orig_img, pose_map, mask = self.preprocessor.generate_pose_and_mask(person_img_path)
        
        # Step 2: Prepare Saree Image
        processed_saree = self.preprocessor.prepare_saree(saree_img_path)
        
        # We save intermediate files if required by diffusion sub-modules
        temp_dir = "outputs/temp"
        os.makedirs(temp_dir, exist_ok=True)
        unique_id = uuid.uuid4().hex
        
        temp_saree_path = f"{temp_dir}/saree_{unique_id}.jpg"
        cv2.imwrite(temp_saree_path, processed_saree)
        
        temp_pose_path = f"{temp_dir}/pose_{unique_id}.jpg"
        cv2.imwrite(temp_pose_path, pose_map)

        print("[Pipeline] 3 & 4. Draping using IDM-VTON Core & Alignment Rules...")
        # Step 3 & 4: Draping & Rules via Diffusion
        diffused_output_path = self.draper.drape(
            person_img_path, 
            temp_saree_path, 
            pose_map, 
            mask, 
            output_path
        )

        print("[Pipeline] 5. Post-Processing (Alpha Blending, Lighting, SD Refinement)...")
        # Step 5: Post-Processing Details
        diffused_img = cv2.imread(diffused_output_path)
        if diffused_img is None:
            raise Exception("Diffusion step failed producing valid output.")

        # Optional: Blend if local boundary separation is strictly needed over IDM output
        # blended = self.postprocessor.alpha_blend(orig_img, diffused_img, mask)
        # matched = self.postprocessor.match_lighting_and_shadows(orig_img, blended)
        # cv2.imwrite(diffused_output_path, matched)
        
        # Final SD Style realism pass
        final_path = self.postprocessor.enhance_realism(diffused_output_path)
        
        print("[Pipeline] Finished successfully.")
        return final_path

# Example execution hook
if __name__ == "__main__":
    pipeline = AdvancedSareeVTONPipeline()
    # pipeline.run('person.jpg', 'saree.jpg', 'result.jpg')
