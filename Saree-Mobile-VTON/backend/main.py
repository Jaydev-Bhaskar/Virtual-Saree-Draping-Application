import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
from typing import Optional

# Import our ML Engine
from advanced_pipeline.pipeline import AdvancedSareeVTONPipeline

app = FastAPI(title="Virtual Saree Draping API", version="1.0.0")

# CORS config for React Native / Web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Initialize the ML Engine
print("Initializing Advanced Saree Virtual Try-On Engine... (This may take a minute)")
engine = AdvancedSareeVTONPipeline(use_remote_diffusion=True)

# Serve the web UI at root
@app.get("/", response_class=HTMLResponse)
def serve_ui():
    html_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/v1/try-on")
async def perform_try_on(
    user_image: UploadFile = File(...),
    saree_image: UploadFile = File(...),
    pallu_length: Optional[float] = Form(0.5),
    pleats_alignment: Optional[str] = Form("center")
):
    try:
        uid = str(uuid.uuid4())
        u_path = f"uploads/user_{uid}.jpg"
        s_path = f"uploads/saree_{uid}.jpg"
        out_path = f"outputs/res_{uid}.jpg"

        with open(u_path, "wb") as buffer:
            shutil.copyfileobj(user_image.file, buffer)
        with open(s_path, "wb") as buffer:
            shutil.copyfileobj(saree_image.file, buffer)

        # Run IDM-VTON AI Pipeline
        res_path = engine.drape_saree(
            user_image_path=u_path,
            saree_image_path=s_path,
            output_path=out_path,
            pallu_length=pallu_length,
            pleats_alignment=pleats_alignment
        )

        if os.path.exists(res_path):
            return FileResponse(res_path, media_type="image/jpeg")
        else:
            raise HTTPException(status_code=500, detail="Failed to generate output")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
