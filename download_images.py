import urllib.request
import os

images = {
  'crimson_banarasi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/A_Woman_in_Saree.jpg',
  'royal_blue_kanjivaram.jpg': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Sridevi_in_saree.jpg',
  'emerald_organza.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Nandita_Das.jpg',
  'lavender_chiffon.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Aishwarya_Rai_in_sari.jpg',
  'golden_georgette.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Rani_Mukerji.jpg',
  'magenta_silk.jpg': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Vidya_Balan.jpg'
}

req = urllib.request.build_opener()
req.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')]
urllib.request.install_opener(req)

out_dir = r"c:\Users\HP\Desktop\Avinython\Virtual-Saree-Draping-Application\frontend\public\images"
os.makedirs(out_dir, exist_ok=True)

for name, url in images.items():
    path = os.path.join(out_dir, name)
    try:
        urllib.request.urlretrieve(url, path)
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
