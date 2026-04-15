# PROJECT EXPORT: Virtual Saree Try-On Mobile Application

This document contains the complete structural and logical breakdown of the application for seamless migration and continued development.

---

## 1. Project Description
**Virtual Saree Try-On** is an AI-powered fashion platform designed to solve the "Visualization Gap" in ethnic wear e-commerce. It allows users to upload a photo and see themselves realistically draped in high-quality sarees, preserving their facial identity and the intricate textures of the fabric.

---

## 2. Implemented Features
*   **Intelligent Image Hosting:** Secure upload and storage of user photos and generated previews.
*   **MediaPipe Face Extraction:** Automated landmark detection to ensure the user's face remains sharp and unaltered during the draping process.
*   **AI Draping Engine (IDM-VTON):** Physics-aware diffusion model that maps saree textures to body posture.
*   **Shareable Lookbook:** feature allowing users to curate favorites and generate a unique public URL.
*   **Dynamic Dashboard:** Real-time history tracking and AI-driven style recommendations.
*   **Face-Aware Masking:** Sophisticated post-processing to blend the saree and user body seamlessly.

---

## 3. UI Structure (Mobile-First)
*   **Experience Flow:**
    1.  **Home:** Professional landing with "Start Journey" CTA.
    2.  **Inventory:** Infinite-scroll gallery of real sarees with "Try-On" triggers.
    3.  **Try-On Page:** Interface for photo upload, angle selection (Front/Side), and real-time generation.
    4.  **Dashboard/Lookbook:** Personal hub with history cards and sharing checkboxes.
*   **Key Components:**
    *   Glassmorphism CSS cards for a premium feel.
    *   Responsive Sidebar for navigation (History, Settings, Inventory).
    *   Floating "Share" buttons with logic-linked counters.

---

## 4. AI & Logical Framework

### **A. Prompt Strategy**
The system uses a 3-layer prompt construction for the Diffusion engine:
1.  **Base Layer:** High-resolution fashion photography, studio lighting.
2.  **Garment Layer:** Dynamic replacement of `[FABRIC]`, `[COLOR]`, and `[WEAVE_PATTERN]`.
3.  **Posture Layer:** `[VIEW_ANGLE]` (e.g., "front view", "side profile") to guide the warping.

### **B. Occasion Mapping Logic**
*   **Wedding:** `{"palette": "Red/Gold/Maroon", "fabric": "Kanchipuram/Banarasi Silk", "style": "Traditional Ornamentation"}`
*   **Party:** `{"palette": "Black/Navy/Deep Emerald", "fabric": "Georgette/Chiffon", "style": "Modern Drape, Designer Border"}`
*   **Casual:** `{"palette": "Pastels/Cream", "fabric": "Chanderi/Cotton", "style": "Simplistic, Daily Wear"}`

### **C. Multi-View Engine**
Logic used to handle different perspectives:
*   **Front View:** Focused on "Full Pallu" visibility and pleat alignment.
*   **Side View:** Focused on "Profile Drape" and fabric flow along the torso.

---

## 5. Technology Stack
*   **Frontend:** ReactJS, Tailwind CSS, Lucide Icons.
*   **Backend:** Python 3.10, FastAPI (Asynchronous API), Uvicorn.
*   **Database:** MongoDB (User metadata, history, and lookbooks).
*   **AI Infrastructure:**
    *   **Generation:** IDM-VTON (Primary), FLUX.1 (Texture enhancement).
    *   **Vision:** Google Gemini 2.0 Flash (Styling analysis).
    *   **Processing:** PyTorch & MediaPipe.

---

## 6. Folder Structure
```text
/root
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (tryon.py, lookbook.py)
│   │   ├── services/     # AI Logic (tryon_engine.py, mask_gen.py)
│   │   └── core/         # MongoDB & Auth config
│   └── uploads/          # Local storage for images
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Layout, ProtectedRoute
│   │   ├── pages/        # Dashboard.jsx, Lookbook.jsx, Inventory.jsx
│   │   └── api.js        # Global API & Asset URL config
│   └── public/           # Static saree asset inventory
└── docs/                 # TECHNICAL_APPROACH.md, IMPACT_BENEFITS.md
```

---

## 7. Instructions for Continued Development

### **To Add New Saree Fabrics:**
1.  Add the saree image to `frontend/public/images/`.
2.  Insert a new entry in the MongoDB `clothing` collection with the corresponding tags.

### **To Modify AI Behavior:**
*   Edit `backend/app/services/tryon_engine.py`.
*   Adjust the `_run_tryon` prompts to change the "style" of the drape.

### **To Enhance Dashboard UI:**
*   Modify `frontend/src/pages/Dashboard.jsx`.
*   The "Smart Scanner" function can be extended to handle custom "Collections" or "Wishlists".

---

## 8. Critical Implementation Notes
*   **Identity Preservation:** Always run MediaPipe before the Diffusion step to generate a "Face Protection Mask."
*   **Asset Paths:** Use the `getAssetUrl` utility in the frontend to avoid broken images during deployment.
*   **Database Sync:** Ensure the `user_id` in the token matches the `user_id` in the `tryon_results` collection for history visibility.

---
**END OF EXPORT**
