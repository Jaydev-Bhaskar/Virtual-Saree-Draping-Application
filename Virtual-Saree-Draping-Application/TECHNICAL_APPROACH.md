# Detailed Technical Architecture & Flow

![High-Detail Tech Infographic](C:\Users\HP\.gemini\antigravity\brain\2ee5cf86-681b-4608-850a-90f324317fa6\detailed_technical_architecture_1775731371071.png)

## 🛠️ Integrated Tech Stack

### **Frontend**
*   **Framework:** React.js (High-performance web architecture)
*   **Styling:** Tailwind CSS (Modern Glassmorphism UI)
*   **Assets:** Lucide Icons & Inter Typography

### **Backend**
*   **Engine:** Python 3.10+
*   **Web Framework:** FastAPI (Asynchronous high-concurrency API)
*   **Server:** Uvicorn (ASGI interface)

### **Database & Security**
*   **Primary DB:** MongoDB (NoSQL for dynamic saree & user metadata)
*   **Security:** JWT (JSON Web Tokens) for secure user sessions

### **AI Engine Sub-Modules (The "Brain")**
*   **MediaPipe Alignment:** This module performs real-time skeletal tracking. It ensures the "Pose" of the user is perfectly detected so the saree can be warped to match the body curves and arm positions.
*   **IDM-VTON (Draping Core):** The primary Diffusion model. It doesn't just "paste" the saree; it mathematically simulates how a specific fabric (Silk vs Chiffon) would fold and drape over that specific detected body shape.
*   **Gemini 1.5/2.0 (The Fashion Critic):** A multimodal model that analyzes the final rendered image to ensure lighting consistency and provides the "Styling Recommendation" notes based on the user's skin tone.
*   **Face-Preservation Logic:** Uses a dedicated identity mask to ensure that while the clothes change, the user's face remains 100% original and sharp.

### **APIs & Services**
*   **Storage:** Local Filesystem with UUID referencing
*   **Public Access:** Public URL generator for Social Lookbooks (Sharing Feature)
