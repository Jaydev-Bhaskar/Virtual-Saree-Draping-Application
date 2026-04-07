# Virtual Saree Draping application

This repository contains the complete Mobile Application (React Native / Expo) and AI Backend (FastAPI / PyTorch) for **Problem Statement ID: SO-3 (Virtual Saree Draping Mobile Application)**.

## 🌟 Key Features
- **Mobile First**: Built with React Native & Expo for smooth cross-platform iOS/Android UI.
- **Advanced Saree Draping Engine**: Implements the CP-VTON (Thin Plate Spline) architecture customized to handle sarees and deep folds.
- **DensePose Integration**: Extracts precise 3D human body geometry allowing the cloth to warp logically across collars, shoulders, and waist.
- **Realistic Blending**: Built-in blending routines using U-Net style segmentation (Mask-RCNN) to keep hands, hair, and lower body strictly isolated.

---

## 🛠️ Tech Stack
- **Frontend**: React Native, Expo, Axios
- **Backend API**: Python, FastAPI, Uvicorn
- **AI / ML**: PyTorch, OpenCV, Detectron2 (DensePose module), Scikit-image

---

## 📁 Directory Structure
```
Saree-Mobile-VTON/
│
├── backend/                  # FastAPI & AI Logic
│   ├── main.py               # API Endpoint Definitions
│   ├── requirements.txt      # Python dependencies
│   ├── engine/               # ML Models
│       └── vton_pipeline.py  # VTON Architecture (TPS, Pose, Warping)
│
└── frontend/                 # React Native Mobile App
    ├── App.js                # Main App entry with Camera/Gallery UI
    └── package.json          # Node dependencies
```

---

## 🚀 Setup & Installation Instructions

### 1. Start the Backend API (PyTorch + FastAPI)
1. Navigate into the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```
   > The API will start on `http://0.0.0.0:8000`. Keep this running.

### 2. Start the Frontend App (React Native)
1. Make sure you have Node.js and Expo installed (`npm install -g expo-cli`).
2. Navigate into the `frontend/` directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Application:
   ```bash
   npm start
   ```
5. Press `a` in the terminal to launch the Android Emulator, or scan the QR code using the **Expo Go** app on your physical mobile device.

---

## ⚠️ Important Configuration Note
If you are running the backend on your laptop and testing on an actual physical Mobile Device using Expo Go, you MUST change the `API_URL` inside `frontend/App.js` from `10.0.2.2` (Emulator localhost) to your Laptop's actual IPv4 address on your Wi-Fi network (e.g. `192.168.1.5`).

```javascript
// frontend/App.js Line 8
const API_URL = "http://192.168.1.5:8000/api/v1/try-on";
```
