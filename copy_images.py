import shutil
import os

src_dest = {
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\crimson_banarasi_1775487816659.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\crimson_banarasi.png",
    
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\royal_blue_kanjivaram_1775487835137.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\royal_blue_kanjivaram.png",
    
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\emerald_organza_1775487854466.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\emerald_organza.png",
    
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\lavender_chiffon_1775487875720.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\lavender_chiffon.png",
    
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\golden_georgette_1775487898421.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\golden_georgette.png",
    
    r"C:\Users\HP\.gemini\antigravity\brain\b3b6b5bd-d645-4cce-b769-24dce7d4c459\magenta_silk_1775487915864.png":
    r"C:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images\magenta_silk.png"
}

for src, dest in src_dest.items():
    if os.path.exists(src):
        shutil.copy(src, dest)
        print(f"Copied {os.path.basename(src)} to {os.path.basename(dest)}")
    else:
        print(f"Missing source file: {src}")
