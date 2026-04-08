import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DEFAULT_MODELS = [
  { id: 1, name: 'Default Model 1', img: '/images/model1.png' },
  { id: 2, name: 'Default Model 2', img: '/images/model2.png' },
];


const ALL_SAREES = [
  { id: 1, name: 'Crimson Banarasi Silk', img: '/images/crimson_banarasi.png' },
  { id: 2, name: 'Royal Blue Kanjivaram', img: '/images/royal_blue_kanjivaram.png' },
  { id: 3, name: 'Emerald Organza', img: '/images/emerald_organza.png' },
  { id: 4, name: 'Lavender Chiffon', img: '/images/lavender_chiffon.png' },
  { id: 5, name: 'Golden Georgette', img: '/images/golden_georgette.png' },
  { id: 6, name: 'Magenta Silk', img: '/images/magenta_silk.png' },
];

const TryOn = () => {
  const location = useLocation();
  const passedSaree = location.state?.selectedSaree;

  const [imageUploaded, setImageUploaded] = useState(null);
  const fileInputRef = React.useRef(null);
  const [selectedSaree, setSelectedSaree] = useState(passedSaree || ALL_SAREES[0]);
  const [generating, setGenerating] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [finalImage, setFinalImage] = useState(null);

  useEffect(() => {
    if (passedSaree) setSelectedSaree(passedSaree);
  }, [passedSaree]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploaded(URL.createObjectURL(file));
      setResultReady(false);
      setFinalImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!imageUploaded) return;
    setGenerating(true);
    setResultReady(false);
    
    try {
        const formData = new FormData();
        const res = await fetch(imageUploaded);
        const blob = await res.blob();
        formData.append('user_image', blob, 'user_photo.jpg');
        formData.append('saree_image_path', selectedSaree.img);

        const response = await fetch('http://127.0.0.1:8000/api/v1/try-on/quick-swap', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error("Backend pipeline failed");
        
        const data = await response.json();
        setFinalImage(`http://127.0.0.1:8000${data.url}`);
    } catch (e) {
        console.error("Backend unavailable.", e);
        setFinalImage(null);
    } finally {
        setResultReady(true);
        setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 className="text-center mb-8"><span className="gradient-text">Virtual Try-On</span> Studio</h1>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6">
          <div className="glass-card">
            <h3 className="mb-4 flex items-center gap-2"><ImageIcon size={20}/> Customer Photo (Model Diagram)</h3>
            
            <div className="mb-4">
              <p className="text-sm text-muted mb-2">Select a default model or upload your own:</p>
              <div className="flex gap-4 mb-4">
                {DEFAULT_MODELS.map(m => (
                  <div 
                    key={m.id} 
                    className={`cursor-pointer transition`}
                    style={{ 
                      width: '80px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                      border: imageUploaded === m.img ? '2px solid var(--primary-color)' : '2px solid transparent'
                    }}
                    onClick={() => { setImageUploaded(m.img); setResultReady(false); setFinalImage(null); }}
                  >
                    <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {!imageUploaded ? (
              <div 
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed glass-border cursor-pointer transition text-muted hover-bg"
                style={{ borderRadius: 'var(--radius-md)', borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                <Upload size={48} className="mb-4 text-muted" />
                <p>Click to browse from local storage</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Upload a front-facing photo for best draping</p>
              </div>
            ) : (
               <div className="img-wrapper relative" style={{ height: '300px', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={imageUploaded} alt="User" style={{ objectFit: 'contain', height: '100%', width: '100%' }} />
                  <button onClick={() => { setImageUploaded(null); fileInputRef.current?.click(); }} className="btn btn-outline" style={{ position: 'absolute', top: 10, right: 10, padding: '4px 8px', fontSize: '0.8rem', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none' }}>Change Photo</button>
               </div>
            )}
          </div>

          <div className="glass-card">
            <h3 className="mb-4 flex items-center gap-2">
              <Sparkles size={20}/> Target Apparel (Clothing Pictures)
            </h3>
            <p className="text-sm text-muted mb-4">Select an apparel to try on:</p>
            <div className="grid grid-cols-3 gap-4" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
              {ALL_SAREES.map(s => (
                <div 
                  key={s.id} 
                  className="cursor-pointer transition"
                  style={{ 
                    height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    border: selectedSaree.id === s.id ? '2px solid var(--primary-color)' : '2px solid transparent'
                  }}
                  onClick={() => setSelectedSaree(s)}
                >
                  <img src={s.img} alt={s.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} title={s.name} />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <p className="gradient-text font-bold m-0">{selectedSaree.name}</p>
            </div>
          </div>

          <button 
            className="btn btn-primary w-full" 
            style={{ padding: '16px', fontSize: '1.2rem', boxShadow: '0 8px 30px rgba(121, 40, 202, 0.4)' }}
            disabled={!imageUploaded || generating}
            onClick={handleGenerate}
          >
            {generating ? <><Loader2 className="animate-spin" /> Processing AI Draping Engine...</> : <><Sparkles /> Generate Premium Try-On</>}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="glass-card flex flex-col items-center justify-center relative min-h-[600px]" style={{ padding: '0', overflow: 'hidden' }}>
          {resultReady && imageUploaded ? (
            <div className="animate-fade-in w-full h-full flex flex-col">
              <div style={{ padding: '24px 24px 0' }}>
                <h3 className="mb-4 flex items-center gap-2"><Sparkles className="text-secondary-color"/> Photorealistic Result</h3>
              </div>
              
              <div className="relative flex-1 w-full" style={{ backgroundColor: '#000', overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative', justifyContent: 'center' }}>
                   
                    {finalImage ? (
                       <img src={finalImage} alt="Photorealistic Face Swap Output" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    ) : (
                       <>
                         <img src={selectedSaree.img} alt="Photorealistic Saree Output" style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.5 }} />
                         <div style={{
                           position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                           display: 'flex', flexDirection: 'column', alignItems: 'center',
                           background: 'rgba(255,77,79,0.2)', padding: '20px', borderRadius: '15px',
                           border: '1px solid rgba(255,77,79,0.5)', backdropFilter: 'blur(10px)',
                           zIndex: 10
                         }}>
                           <h3 className="m-0 text-white font-bold text-center text-danger">Backend Connection Error</h3>
                           <p className="text-white text-sm text-center mt-2 mx-0 mb-0">Check FastAPI logs on port 8000.</p>
                         </div>
                       </>
                    )}
                   
                   <div style={{
                     position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                     background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                     padding: '12px', borderRadius: 'var(--radius-sm)',
                     border: '1px solid var(--glass-border)',
                     color: 'white', textAlign: 'center', fontWeight: 'bold',
                     zIndex: 10
                   }}>
                     Face swapped seamlessly onto {selectedSaree.name}
                   </div>
                </div>
              </div>
              <div className="flex gap-4 p-6 w-full" style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Download HD Render</button>
                <button className="btn btn-outline" style={{ flex: 1 }}>Save Look</button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 opacity-50 flex flex-col items-center justify-center h-full">
              {generating ? (
                <>
                  <div className="relative mb-8">
                    <Loader2 size={100} className="animate-spin text-primary-color relative z-10" />
                    <img src={selectedSaree.img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', position: 'absolute', top: '20px', left: '20px', opacity: 0.8 }} alt="target" />
                  </div>
                  <h3>AI Draping in Progress</h3>
                  <p>Analyzing body pose and fabric flow...</p>
                </>
              ) : (
                <>
                  <Sparkles size={64} className="mb-4 mx-auto text-primary-color" style={{ opacity: 0.5 }} />
                  <h3>Your result will appear here</h3>
                  <p>Upload your customer photo to visualize the <br/><b>{selectedSaree.name}</b> draped realistically.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryOn;
