import os
import time
import uuid
import shutil
try:
    from gradio_client import Client, handle_file
except ImportError:
    pass # Managed by requirements

class SareeVirtualTryOnEngine:
    def __init__(self):
        # We will use the free IDM-VTON spaces for highly realistic results.
        self.space_name = "yisol/IDM-VTON"
        self.api_name = "/tryon"

    def drape_saree(self, user_image_path, saree_image_path, output_path, pallu_length=0.5, pleats_alignment="center"):
        """
        Uses IDM-VTON (yisol space) to accurately drape the saree onto the human body.
        Provides photorealistic folds, segmentation, and lighting adjustments.
        """
        try:
            print(f"[Engine] Starting IDM-VTON generation for Saree...")
            client = Client(self.space_name, verbose=False)

            user_abs = os.path.abspath(user_image_path)
            saree_abs = os.path.abspath(saree_image_path)

            result = client.predict(
                dict={
                    "background": handle_file(user_abs),
                    "layers": [],
                    "composite": None,
                },
                garm_img=handle_file(saree_abs),
                garment_des="a beautiful traditional saree",
                is_checked=True,
                is_checked_crop=False,
                denoise_steps=30,
                seed=42,
                api_name=self.api_name
            )

            # Extract the actual output image path from the result
            result_path = None
            if isinstance(result, (list, tuple)):
                for item in result:
                    if isinstance(item, str) and os.path.exists(item):
                        result_path = item
                        break
                    elif isinstance(item, dict) and "path" in item:
                        if os.path.exists(item["path"]):
                            result_path = item["path"]
                            break
            elif isinstance(result, str) and os.path.exists(result):
                result_path = result

            if result_path:
                shutil.copy2(result_path, output_path)
                print(f"[Engine] Success! Saree draped and saved to {output_path}")
                return output_path
            else:
                raise Exception("IDM-VTON generated an invalid response structure.")

        except Exception as e:
            print(f"[Engine] IDM-VTON Error: {e}")
            raise e

