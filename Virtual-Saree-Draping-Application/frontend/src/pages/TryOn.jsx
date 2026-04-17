import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Loader2, Share2 } from 'lucide-react';
import { useLocation, NavLink } from 'react-router-dom';
import { getApiUrl, getAssetUrl } from '../api';

const AMBIENCE_FILTERS = {
    studio: 'none',
    golden: 'sepia(30%) hue-rotate(-15deg) saturate(140%) brightness(105%)',
    wedding: 'brightness(110%) contrast(115%) saturate(130%)',
    evening: 'brightness(85%) contrast(120%) saturate(110%) hue-rotate(10deg)'
};


const DEFAULT_MODELS = [
  { id: 1, name: 'Default Model 1', img: '/images/model1.png' },
  { id: 2, name: 'Default Model 2', img: '/images/model2.png' },
];

const ALL_SAREES = [
  { id: 1, name: 'Crimson Banarasi Silk', img: '/images/crimson_banarasi.png', variants: [
    { name: 'Crimson', color: '#dc2626' }, { name: 'Maroon', color: '#800000' }, { name: 'Gold', color: '#ffd700' }, { name: 'Deep Green', color: '#006400' }
  ]},
  { id: 2, name: 'Royal Blue Kanjivaram', img: '/images/royal_blue_kanjivaram.png', variants: [
    { name: 'Royal Blue', color: '#2563eb' }, { name: 'Navy', color: '#000080' }, { name: 'Purple', color: '#800080' }, { name: 'Turquoise', color: '#40e0d0' }
  ]},
  { id: 3, name: 'Emerald Organza', img: '/images/emerald_organza.png', variants: [
    { name: 'Emerald', color: '#059669' }, { name: 'Mint', color: '#a7f3d0' }, { name: 'Teal', color: '#008080' }, { name: 'Olive', color: '#556b2f' }
  ]},
  { id: 4, name: 'Lavender Chiffon', img: '/images/lavender_chiffon.png', variants: [
    { name: 'Lavender', color: '#a78bfa' }, { name: 'Dusty Rose', color: '#fda4af' }, { name: 'Lilac', color: '#c084fc' }, { name: 'Periwinkle', color: '#6366f1' }
  ]},
  { id: 5, name: 'Golden Georgette', img: '/images/golden_georgette.png', variants: [
    { name: 'Gold', color: '#fbbf24' }, { name: 'Copper', color: '#b45309' }, { name: 'Champagne', color: '#fef3c7' }, { name: 'Mustard', color: '#ca8a04' }
  ]},
  { id: 6, name: 'Magenta Silk', img: '/images/magenta_silk.png', variants: [
    { name: 'Magenta', color: '#db2777' }, { name: 'Wine', color: '#722f37' }, { name: 'Plum', color: '#8e4585' }, { name: 'Rose', color: '#e11d48' }
  ]},
  { id: 7, name: 'Midnight Velvet', price: '₹16,799', type: 'Saree', img: '/images/midnight_velvet.png', variants: [
    { name: 'Midnight', color: '#1e3a8a' }, { name: 'Black', color: '#000000' }, { name: 'Emerald', color: '#064e3b' }, { name: 'Burgundy', color: '#4c0519' }
  ]},
  { id: 8, name: 'Pastel Peach Net', price: '₹11,299', type: 'Saree', img: '/images/peach_net.png', variants: [
    { name: 'Peach', color: '#fb923c' }, { name: 'Cream', color: '#fffbeb' }, { name: 'Coral', color: '#ff7f50' }, { name: 'Champagne', color: '#fef3c7' }
  ]},
  { id: 9, name: 'Turquoise Patola Silk', price: '₹22,500', type: 'Saree', img: '/images/turquoise_patola.png', variants: [
    { name: 'Turquoise', color: '#06b6d4' }, { name: 'Teal', color: '#134e4a' }, { name: 'Jade', color: '#065f46' }, { name: 'Azure', color: '#007fff' }
  ]},
];

const TryOn = () => {
  const location = useLocation();
  const passedSaree = location.state?.selectedSaree;

  const transformItem = (item) => {
    if (!item) return null;
    return {
        ...item,
        img: item.img || getAssetUrl(item.image_url),
        variants: item.variants || [
            { name: 'Original', color: item.color || '#808080' },
            { name: 'Contrast', color: '#ff4444' },
            { name: 'Deep', color: '#333333' },
            { name: 'Pastel', color: '#ffcc99' }
        ]
    };
  };

  const [imageUploaded, setImageUploaded] = useState(null);
  const fileInputRef = React.useRef(null);
  const [items, setItems] = useState([]);
  
  // Multi-saree State
  const [selectedSarees, setSelectedSarees] = useState(passedSaree ? [transformItem(passedSaree)] : []);
  const [generatedResults, setGeneratedResults] = useState([]);
  const [currentViewingIndex, setCurrentViewingIndex] = useState(0);
  const [processingProgress, setProcessingProgress] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  
  // Active states for customization derived from currentView
  const [activeColor, setActiveColor] = useState(null);
  const [recoloredImage, setRecoloredImage] = useState(null);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [viewMode, setViewMode] = useState('standard');
  const [ambience, setAmbience] = useState('studio');

  const [showSmartFit, setShowSmartFit] = useState(false);
  const [fitData, setFitData] = useState({ height: '', weight: '', heightUnit: 'cm', weightUnit: 'kg' });
  const [fitResult, setFitResult] = useState(null);

  const calculateFit = () => {
      let h = parseFloat(fitData.height);
      let w = parseFloat(fitData.weight);
      if (!h || !w) return;
      if (fitData.heightUnit === 'ft') h = h * 30.48; 
      if (fitData.weightUnit === 'lbs') w = w * 0.453592;

      let pallu = 1.1; let pleats = 5;
      if (h > 165) { pallu = 1.3; pleats = 6; }
      else if (h < 155) { pallu = 0.9; pleats = 4; }

      let styleRec = "Standard Nivi Drape";
      if (w > 75) styleRec = "Bengali Drape (Adds structure)";
      else if (w < 50) styleRec = "Mermaid Flowy Drape";

      setFitResult({
          palluLength: `${pallu.toFixed(1)} meters`,
          pleatCount: `${pleats} neat pleats`,
          fabricNeeded: (w > 80 || h > 170) ? "6.0 meters" : "Standard 5.5 meters",
          recommendation: styleRec
      });
  };

  const activeResult = generatedResults[currentViewingIndex];
  const finalImage = activeResult?.imgUrl || null;
  const sareeMask = activeResult?.mask || null;
  const activeSaree = activeResult ? activeResult.saree : (selectedSarees.length > 0 ? selectedSarees[selectedSarees.length - 1] : null);

  useEffect(() => {
     setActiveColor(null);
     setRecoloredImage(null);
     setIsSaved(false);
  }, [currentViewingIndex]);

  const handleSaveToHistory = async () => {
      setIsSaving(true);
      try {
          const imageToSave = recoloredImage || finalImage;
          const token = localStorage.getItem('token');
          await fetch(getApiUrl('/try-on/save-history'), {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  image_data: imageToSave,
                  clothing_name: activeSaree?.name || 'Custom Saree',
                  clothing_id: activeSaree?.id ? String(activeSaree.id) : undefined
              })
          });
          setIsSaved(true);
      } catch (e) {
          console.error("Failed to save to history", e);
      } finally {
          setIsSaving(false);
      }
  };
  
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/clothing/'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const fetchedItems = (data.items || []).map(transformItem);
        setItems(fetchedItems);
        
        if (passedSaree) {
            const enriched = fetchedItems.find(s => String(s.id) === String(passedSaree.id)) || transformItem(passedSaree);
            setSelectedSarees([enriched]);
        } else if (fetchedItems.length > 0 && selectedSarees.length === 0) {
            setSelectedSarees([fetchedItems[0]]);
        }
      } catch (err) {
          console.error("Failed to load collection", err);
      }
    };
    fetchItems();
  }, [passedSaree]);

  const handleShareLook = async () => {
    const imageUrl = recoloredImage || finalImage;
    if (!imageUrl || !navigator.share) {
        alert("Sharing is not seamlessly supported on this browser. Please use 'Download Render' instead to share manually.");
        return;
    }
    
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my_saree_look.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
            title: 'My Virtual Saree Try-On!',
            text: `Check out how this ${activeSaree?.name || 'saree'} looks on me!`,
            files: [file]
        });
    } catch (err) {
        console.log("Error sharing natively:", err);
        try {
            await navigator.share({
                title: 'My Virtual Saree Try-On!',
                text: `Check out how this ${activeSaree?.name || 'saree'} looks on me!`,
                url: window.location.href
            });
        } catch (e) {
            console.log("Fallback share failed");
        }
    }
  };

  const handleDownload = async () => {
    const imageUrl = recoloredImage || finalImage;
    if (!imageUrl) return;
    
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `AVINYTHON_Saree_${activeSaree?.name ? activeSaree.name.replace(/\s+/g, '_') : 'TryOn'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error("Download failed", e);
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'AVINYTHON_Saree_TryOn.jpg';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
        const token = localStorage.getItem('token');
        await fetch(getApiUrl('/feedback/'), {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clothing_id: activeSaree?.id,
                rating: feedback.rating,
                comment: feedback.comment
            })
        });
        setFeedbackSent(true);
    } catch (err) {
        console.error("Feedback failed", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploaded(URL.createObjectURL(file));
      setResultReady(false);
      setGeneratedResults([]);
    }
  };

  const toggleSareeSelection = (s) => {
      if (selectedSarees.some(ss => ss.id === s.id)) {
          setSelectedSarees(selectedSarees.filter(ss => ss.id !== s.id));
      } else {
          setSelectedSarees([...selectedSarees, s]);
      }
  };

  const handleGenerate = async () => {
    if (!imageUploaded || selectedSarees.length === 0) return;
    setGenerating(true);
    setResultReady(false);
    setGeneratedResults([]);
    setCurrentViewingIndex(0);
    setActiveColor(null);
    setRecoloredImage(null);
    
    try {
        const res = await fetch(imageUploaded);
        const blob = await res.blob();
        
        let tempResults = [];
        
        for (let i = 0; i < selectedSarees.length; i++) {
            const saree = selectedSarees[i];
            setProcessingProgress(`Generating ${i + 1} of ${selectedSarees.length}...`);
            
            const formData = new FormData();
            formData.append('user_image', blob, 'user_photo.jpg');
            formData.append('saree_image_path', saree.img);

            const response = await fetch(getApiUrl('/try-on/quick-swap'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Backend pipeline failed");
            
            const data = await response.json();
            tempResults.push({
                saree: saree,
                imgUrl: getAssetUrl(data.url),
                mask: data.mask
            });
            // Show immediate progress as each finishes
            setGeneratedResults([...tempResults]);
        }
        setIsSaved(false);
    } catch (e) {
        console.error("Backend unavailable.", e);
    } finally {
        setResultReady(true);
        setGenerating(false);
        setProcessingProgress('');
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  useEffect(() => {
    if (!finalImage || !sareeMask || !activeColor) {
        setRecoloredImage(null);
        return;
    }

    const applyColorTransform = async () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = finalImage;
        await new Promise(resolve => img.onload = resolve);

        const maskImg = new Image();
        maskImg.src = sareeMask;
        await new Promise(resolve => maskImg.onload = resolve);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const maskCtx = maskCanvas.getContext('2d');
        maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
        const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

        const targetRgb = hexToRgb(activeColor);
        
        for (let i = 0; i < imgData.data.length; i += 4) {
            const maskAlpha = maskData.data[i];
            if (maskAlpha > 30) {
                const r = imgData.data[i];
                const g = imgData.data[i+1];
                const b = imgData.data[i+2];

                const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
                
                imgData.data[i] = targetRgb.r * luma;
                imgData.data[i+1] = targetRgb.g * luma;
                imgData.data[i+2] = targetRgb.b * luma;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        setRecoloredImage(canvas.toDataURL());
    };

    applyColorTransform();
  }, [activeColor, finalImage, sareeMask]);

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
                    onClick={() => { setImageUploaded(m.img); setResultReady(false); setGeneratedResults([]); }}
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
            <h3 className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles size={20}/> Target Apparel (Selected Sarees)</span>
              <span className="text-xs bg-primary-color/20 text-primary-color px-2 py-1 rounded-full">{selectedSarees.length} Selected</span>
            </h3>
            
            <p className="text-sm text-muted mb-4">Select one or multiple appreals to try on:</p>
            <div className="grid grid-cols-3 gap-4" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
            {items.map(s => {
                const isSelected = selectedSarees.some(ss => ss.id === s.id);
                return (
                <div 
                key={s.id} 
                className="cursor-pointer transition relative"
                style={{ 
                    height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    border: isSelected ? '2px solid var(--primary-color)' : '2px solid transparent'
                }}
                onClick={() => toggleSareeSelection(s)}
                >
                {isSelected && <div className="absolute top-1 right-1 bg-primary-color rounded-full w-5 h-5 flex items-center justify-center text-white text-xs z-10 shadow-lg">✓</div>}
                <img src={s.img} alt={s.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} title={s.name} />
                </div>
            )})}
            </div>
            
            <div className="mt-4 p-3" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <p className="gradient-text font-bold m-0">{activeSaree ? activeSaree.name : 'No Saree Selected'}</p>
            </div>

            {/* Color Customization - Applies to active saree */}
            {(activeSaree && activeSaree.variants) && (
                <div className="mt-8 pt-6 animate-fade-in" style={{ borderTop: '2px dashed rgba(255,255,255,0.1)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="m-0 flex items-center gap-2 text-white">
                            <Sparkles size={18} className="text-secondary-color"/> CHOOSE YOUR COLOR
                        </h3>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/20 hover:border-primary-color transition">
                                <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Custom Picker</span>
                                <input 
                                    type="color" 
                                    value={activeColor || '#ffffff'} 
                                    onChange={(e) => setActiveColor(e.target.value)}
                                    style={{ width: '22px', height: '22px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                />
                            </div>
                            <button 
                                className="text-[10px] text-primary-color uppercase font-bold hover:text-white transition bg-transparent border-none p-0 cursor-pointer"
                                onClick={() => setActiveColor(null)}
                            >
                                Reset Original
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-start">
                        {activeSaree.variants.map((v, idx) => (
                            <div 
                                key={idx} 
                                className="flex flex-col items-center gap-2 cursor-pointer group"
                                onClick={() => setActiveColor(v.color)}
                            >
                                <div 
                                    style={{ 
                                        width: '42px', height: '42px', background: v.color, borderRadius: '50%',
                                        border: activeColor === v.color ? '3px solid white' : '2px solid rgba(255,255,255,0.1)',
                                        boxShadow: activeColor === v.color ? '0 0 20px ' + v.color : 'none',
                                        transform: activeColor === v.color ? 'scale(1.15)' : 'scale(1)',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                    className="hover:scale-110 hover:shadow-lg"
                                />
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    color: activeColor === v.color ? 'white' : 'rgba(255,255,255,0.4)',
                                    fontWeight: activeColor === v.color ? 'bold' : 'normal'
                                }}>
                                    {v.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Smart Fit Calculator */}
          <div className="glass-card mb-4" style={{ padding: '20px' }}>
              <div 
                  className="flex justify-between items-center cursor-pointer transition hover:text-primary-color"
                  onClick={() => setShowSmartFit(!showSmartFit)}
              >
                  <h3 className="m-0 flex items-center gap-2"><Sparkles size={18}/> Smart Fit & Drape Calculator</h3>
                  <span className="text-xl font-bold bg-white/5 rounded-full w-8 h-8 flex items-center justify-center">{showSmartFit ? '-' : '+'}</span>
              </div>
              
              {showSmartFit && (
                  <div className="mt-6 animate-fade-in border-t border-white/10 pt-4">
                      <p className="text-sm text-muted mb-4">Enter your dimensions to securely calculate the perfect draping physics, pleat counts, and pallu drops.</p>
                      <div className="flex gap-4 mb-4">
                          <div className="flex-1">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1 block">Height</label>
                              <div className="flex bg-black/30 rounded border border-white/10 overflow-hidden focus-within:border-primary-color">
                                  <input type="number" className="bg-transparent border-none text-white p-2 w-full outline-none" placeholder="e.g. 165" value={fitData.height} onChange={(e) => setFitData({...fitData, height: e.target.value})} />
                                  <select className="bg-white/5 border-none text-muted text-xs px-2 outline-none" value={fitData.heightUnit} onChange={(e) => setFitData({...fitData, heightUnit: e.target.value})}>
                                      <option value="cm">cm</option>
                                      <option value="ft">ft</option>
                                  </select>
                              </div>
                          </div>
                          <div className="flex-1">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-1 block">Weight</label>
                              <div className="flex bg-black/30 rounded border border-white/10 overflow-hidden focus-within:border-primary-color">
                                  <input type="number" className="bg-transparent border-none text-white p-2 w-full outline-none" placeholder="e.g. 60" value={fitData.weight} onChange={(e) => setFitData({...fitData, weight: e.target.value})} />
                                  <select className="bg-white/5 border-none text-muted text-xs px-2 outline-none" value={fitData.weightUnit} onChange={(e) => setFitData({...fitData, weightUnit: e.target.value})}>
                                      <option value="kg">kg</option>
                                      <option value="lbs">lbs</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                      
                      <button className="btn btn-outline w-full mb-4 max-w-xs mx-auto block py-2" onClick={calculateFit}>Analyze Fit</button>
                      
                      {fitResult && (
                          <div className="p-4 bg-primary-color/10 rounded-lg border border-primary-color/20 mt-4">
                              <h4 className="text-primary-color mb-3 font-bold border-b border-primary-color/20 pb-2">Your Personalised Draping Physics</h4>
                              <div className="grid grid-cols-2 gap-y-3 text-sm">
                                  <div className="flex flex-col"><span className="text-xs text-muted uppercase">Pallu Drop</span><span className="font-bold">{fitResult.palluLength}</span></div>
                                  <div className="flex flex-col"><span className="text-xs text-muted uppercase">Waist Pleats</span><span className="font-bold">{fitResult.pleatCount}</span></div>
                                  <div className="flex flex-col"><span className="text-xs text-muted uppercase">Optimal Fabric</span><span className="font-bold">{fitResult.fabricNeeded}</span></div>
                                  <div className="flex flex-col"><span className="text-xs text-muted uppercase">Drape Style</span><span className="font-bold text-secondary-color">{fitResult.recommendation}</span></div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>

          {isAuthenticated ? (
              <button 
                className="btn btn-primary w-full" 
                style={{ padding: '16px', fontSize: '1.2rem', boxShadow: '0 8px 30px rgba(121, 40, 202, 0.4)' }}
                disabled={!imageUploaded || generating || selectedSarees.length === 0}
                onClick={handleGenerate}
              >
                {generating ? <><Loader2 className="animate-spin" /> {processingProgress || 'Processing...'}</> : <><Sparkles /> Generate Premium Try-On ({selectedSarees.length})</>}
              </button>
          ) : (
              <div className="p-6 bg-primary-color/10 rounded-xl border border-primary-color/30 text-center animate-fade-in">
                  <h4 className="mb-2 text-primary-color">AI Draping Locked</h4>
                  <p className="text-sm mb-4">Please create an account or sign in to use our premium AI virtual try-on technology.</p>
                  <NavLink to="/login" className="btn btn-primary w-full">Sign In to Generate</NavLink>
              </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="flex flex-col gap-4">
            <div className="glass-card flex flex-col items-center justify-center relative min-h-[600px]" style={{ padding: '0', overflow: 'hidden', width: '100%' }}>
            {resultReady && imageUploaded ? (
                <div className="animate-fade-in w-full h-full flex flex-col">
                <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="m-0 flex items-center gap-2"><Sparkles className="text-secondary-color"/> Photorealistic Result</h3>
                    {finalImage && (
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                            <button className={`px-4 py-1 rounded-full text-xs transition border-none cursor-pointer ${viewMode === 'standard' ? 'bg-primary-color text-white' : 'text-muted bg-transparent'}`} onClick={() => setViewMode('standard')}>Standard View</button>
                            <button className={`px-4 py-1 rounded-full text-xs transition border-none cursor-pointer ${viewMode === 'gallery3d' ? 'bg-primary-color text-white' : 'text-muted bg-transparent'}`} onClick={() => setViewMode('gallery3d')}>Side-by-Side Collage (3 Poses)</button>
                        </div>
                    )}
                </div>
                
                <div className="relative flex-1 w-full" style={{ backgroundColor: '#000', overflow: 'hidden' }}>
                    {viewMode === 'standard' || !finalImage ? (
                        <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative', justifyContent: 'center' }}>
                            {finalImage ? (
                                <img src={recoloredImage || finalImage} alt="Photorealistic Face Swap Output" style={{ objectFit: 'contain', width: '100%', height: '100%', filter: AMBIENCE_FILTERS[ambience], transition: 'filter 0.5s ease' }} />
                            ) : (
                            <>
                                <img src={activeSaree?.img} alt="Photorealistic Saree Output" style={{ objectFit: 'contain', width: '100%', height: '100%', opacity: 0.5 }} />
                                <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: 'rgba(255,77,79,0.2)', padding: '20px', borderRadius: '15px',
                                border: '1px solid rgba(255,77,79,0.5)', backdropFilter: 'blur(10px)',
                                zIndex: 10
                                }}>
                                <h3 className="m-0 text-white font-bold text-center text-danger">Generation Error</h3>
                                <p className="text-white text-sm text-center mt-2 mx-0 mb-0">Could not parse result for this saree.</p>
                                </div>
                            </>
                            )}
                        </div>
                    ) : (
                        <div className="flex w-full h-full p-4 gap-4 justify-center items-stretch" style={{ backgroundColor: '#111' }}>
                            <div className="flex-1 relative border border-white/20 rounded shadow-2xl overflow-hidden bg-black flex flex-col justify-end transition hover:border-primary-color">
                                <img src={recoloredImage || finalImage} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: AMBIENCE_FILTERS[ambience], transition: 'filter 0.5s ease' }} />
                                <div className="absolute bottom-0 w-full bg-black/80 py-2 text-center text-white text-xs font-bold tracking-wider">LEFT DRAUGHT</div>
                            </div>
                            <div className="flex-1 relative border border-white/20 rounded shadow-2xl overflow-hidden bg-black flex flex-col justify-end transition hover:border-primary-color">
                                <img src={recoloredImage || finalImage} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: AMBIENCE_FILTERS[ambience], transition: 'filter 0.5s ease' }} />
                                <div className="absolute bottom-0 w-full bg-black/80 py-2 text-center text-white text-xs font-bold tracking-wider">RIGHT DRAUGHT (MIRRORED)</div>
                            </div>
                            <div className="flex-1 relative border border-white/20 rounded shadow-2xl overflow-hidden bg-black flex flex-col justify-end transition hover:border-primary-color">
                                <img src={recoloredImage || finalImage} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transform: 'scale(1.2)', filter: AMBIENCE_FILTERS[ambience], transition: 'filter 0.5s ease' }} />
                                <div className="absolute bottom-0 w-full bg-black/80 py-2 text-center text-white text-xs font-bold tracking-wider">UPPER PORTRAIT</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Magic Ambience Studio */}
                {finalImage && (
                <div className="p-4" style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-secondary-color"/> Magic Lighting Studio</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[
                            { id: 'studio', name: 'Studio White', icon: '⚪' },
                            { id: 'golden', name: 'Golden Hour', icon: '🌅' },
                            { id: 'wedding', name: 'Wedding Glow', icon: '✨' },
                            { id: 'evening', name: 'Evening Neon', icon: '🌃' }
                        ].map(a => (
                            <button
                                key={a.id}
                                className={`btn ${ambience === a.id ? 'btn-primary' : 'btn-outline'} text-xs py-1.5 px-3 flex-shrink-0 flex items-center gap-1`}
                                style={{ borderRadius: '20px' }}
                                onClick={() => setAmbience(a.id)}
                            >
                                <span>{a.icon}</span> {a.name}
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {/* Thumbnails Gallery */}
                {generatedResults.length > 1 && (
                    <div className="p-4 flex gap-3 overflow-x-auto" style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)' }}>
                        {generatedResults.map((res, idx) => (
                            <div 
                                key={idx}
                                className="cursor-pointer transition border-2 flex-shrink-0"
                                style={{
                                    width: '60px', height: '80px', borderRadius: '8px', overflow: 'hidden',
                                    borderColor: currentViewingIndex === idx ? 'var(--primary-color)' : 'transparent',
                                    opacity: currentViewingIndex === idx ? 1 : 0.6
                                }}
                                onClick={() => setCurrentViewingIndex(idx)}
                            >
                                <img src={res.imgUrl} alt={res.saree.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-4 p-6 w-full flex-wrap justify-between items-center" style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                    <button 
                        className={`btn ${isSaved ? 'btn-outline' : 'btn-primary'}`} 
                        style={{ flex: 1, minWidth: '130px' }} 
                        onClick={handleSaveToHistory}
                        disabled={isSaving || isSaved}
                    >
                        {isSaving ? <Loader2 className="animate-spin inline-block mr-2" /> : isSaved ? '✓ Saved!' : 'Save to Lookbook'}
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(45deg, #128C7E, #25D366)', border: 'none', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }} onClick={handleShareLook}>
                        <Share2 size={16} /> Make it Viral
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1, minWidth: '130px' }} onClick={handleDownload}>Download</button>
                    <button className="btn btn-outline" style={{ flex: 1, minWidth: '130px' }} onClick={() => setShowFeedback(true)}>Feedback</button>
                </div>

                {showFeedback && (
                    <div className="p-6 animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
                        <h4 className="mb-4 gradient-text">Rate this Look</h4>
                        {feedbackSent ? (
                            <div className="text-center py-4 bg-green-500/10 rounded-lg border border-green-500/20 text-green-400">
                                <p className="font-bold">✓ Feedback submitted! Thank you.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2 justify-center">
                                    {[1,2,3,4,5].map(num => (
                                        <button 
                                            key={num} 
                                            className={`btn ${feedback.rating === num ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ minWidth: '40px', padding: '8px' }}
                                            onClick={() => setFeedback({...feedback, rating: num})}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="input" 
                                    placeholder="Any comments on the fit or color?" 
                                    style={{ height: '80px', padding: '10px' }}
                                    value={feedback.comment}
                                    onChange={e => setFeedback({...feedback, comment: e.target.value})}
                                />
                                <button className="btn btn-primary w-full" onClick={handleFeedbackSubmit}>Submit Review</button>
                            </div>
                        )}
                    </div>
                )}
                </div>
            ) : (
                <div className="text-center p-8 opacity-50 flex flex-col items-center justify-center h-full">
                {generating ? (
                    <>
                    <div className="relative mb-8">
                        <Loader2 size={100} className="animate-spin text-primary-color relative z-10" />
                        {activeSaree && <img src={activeSaree.img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', position: 'absolute', top: '20px', left: '20px', opacity: 0.8 }} alt="target" />}
                    </div>
                    <h3>AI Draping in Progress</h3>
                    <p>{processingProgress || "Analyzing body pose and fabric flow..."}</p>
                    
                    {/* Add progress overview during generation */}
                    {selectedSarees.length > 1 && (
                        <div className="mt-8 flex gap-2">
                            {selectedSarees.map((s, idx) => (
                                <div key={idx} style={{ 
                                    width: '10px', height: '10px', borderRadius: '50%', 
                                    background: idx < generatedResults.length ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)' 
                                }} />
                            ))}
                        </div>
                    )}
                    </>
                ) : (
                    <>
                    <Sparkles size={64} className="mb-4 mx-auto text-primary-color" style={{ opacity: 0.5 }} />
                    <h3>Your result will appear here</h3>
                    <p>Upload your customer photo to visualize <br/><b>{activeSaree ? (selectedSarees.length > 1 ? `the ${selectedSarees.length} selected sarees` : activeSaree.name) : 'the selected saree'}</b> draped realistically.</p>
                    </>
                )}
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
