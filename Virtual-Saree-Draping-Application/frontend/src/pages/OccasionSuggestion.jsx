import React, { useState } from 'react';
import { Sparkles, Camera, Loader2, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../api';

const OccasionSuggestion = () => {
    const [occasion, setOccasion] = useState('wedding');
    const [userImage, setUserImage] = useState(null);
    const [userImageId, setUserImageId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [uploading, setUploading] = useState(false);

    const occasions = [
        { 
            id: 'wedding', 
            name: 'Wedding', 
            desc: 'Traditional Red Silk', 
            img: '/images/wedding_ref.jpg', // Placeholder - will use your logic
            color: 'Red/Maroon',
            fabric: 'Silk',
            border: 'Heavy Gold'
        },
        { 
            id: 'party', 
            name: 'Party', 
            desc: 'Modern Black Chiffon', 
            img: '/images/party_ref.jpg',
            color: 'Black/Navy',
            fabric: 'Chiffon',
            border: 'Designer'
        },
        { 
            id: 'casual', 
            name: 'Casual', 
            desc: 'Light Blue Cotton', 
            img: '/images/casual_ref.jpg',
            color: 'Pastels',
            fabric: 'Cotton/Linen',
            border: 'Simple'
        }
    ];

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(getApiUrl('/uploads'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await response.json();
            
            // Fix: Capture ID from either .id or ._id (MongoDB style)
            const id = data.id || data._id;
            if (id) {
                setUserImage(getAssetUrl(data.file_url));
                setUserImageId(id);
                console.log("Upload success, ID:", id);
            } else {
                console.error("No ID in response", data);
                alert("Upload failed: No ID returned from server.");
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Connection error during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async (selectedOccasion = occasion) => {
        if (!userImageId) {
            alert("Please upload your photo first!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('occasion', selectedOccasion);
        formData.append('user_image_id', userImageId);

        try {
            const response = await fetch(getApiUrl('/try-on/suggest'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Generation failed on server");
            }

            const data = await response.json();
            console.log("AI Suggestion Result:", data);
            
            if (data && data.image_url) {
                setResult(data);
            } else {
                throw new Error("Server returned empty design data");
            }
        } catch (err) {
            console.error("Generation failed", err);
            alert(`AI Generation failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="gradient-text text-4xl mb-2">Occasion-Based Suggestions</h1>
                <p className="text-muted">Tell us where you are going, and our AI will drape the perfect saree for you.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Step 1: Upload */}
                <div className="glass-card p-8 flex flex-col items-center">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-[10px] uppercase tracking-[3px] text-primary-color mb-1">Step One</span>
                        <h3 className="m-0 text-xl font-bold">Upload Your Photo</h3>
                    </div>
                    
                    <div className="relative w-full group">
                        <div className="upload-box w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:border-primary-color/50 group-hover:bg-primary-color/5" 
                             style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                            {userImage ? (
                                <img src={userImage} className="w-full h-full object-cover" alt="User" />
                            ) : (
                                <div className="text-center p-6 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Camera size={32} className="text-muted" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm font-medium mb-1">Click to Upload</p>
                                    <p className="text-[11px] text-muted max-w-[150px]">Best results with a clear front-facing portrait</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            {uploading && (
                                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-primary-color mb-2" size={32} />
                                    <span className="text-xs font-bold tracking-widest uppercase">Uploading</span>
                                </div>
                            )}
                        </div>
                        {userImage && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-success-color text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <CheckCircle2 size={12} /> PHOTO READY
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Choose Occasion */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="glass-card p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-[3px] text-primary-color mb-1">Step Two</span>
                                <h3 className="m-0 text-xl font-bold">Select Occasion</h3>
                            </div>
                            <div className="relative min-w-[200px]">
                                <select 
                                    value={occasion} 
                                    onChange={(e) => setOccasion(e.target.value)}
                                    className="form-input w-full appearance-none pr-10 cursor-pointer text-sm"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <option value="wedding">Wedding Ceremony</option>
                                    <option value="party">Evening Party</option>
                                    <option value="casual">Casual / Day Out</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {occasions.map(occ => (
                                <div 
                                    key={occ.id}
                                    onClick={() => setOccasion(occ.id)}
                                    className={`p-4 rounded-xl border transition cursor-pointer ${occasion === occ.id ? 'border-primary-color bg-primary-color/5' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <h4 className="m-0 text-sm font-bold">{occ.name} Look</h4>
                                    <p className="text-xs text-muted mb-3">{occ.desc}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="opacity-60">Color:</span>
                                            <span>{occ.color}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="opacity-60">Fabric:</span>
                                            <span>{occ.fabric}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            disabled={loading || uploading || !userImageId}
                            onClick={() => handleGenerate()}
                            className="btn btn-primary w-full mt-6 flex items-center justify-center gap-2 py-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                            {loading ? 'AI is Draping...' : 'Drape My Occasion Look'}
                        </button>
                    </div>

                    {/* Result Area */}
                    {result && (
                        <div className="glass-card p-6 animate-scale-up border-primary-color/30" style={{ borderWidth: '2px' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="m-0 font-bold text-lg">{occasion.toUpperCase()} STYLE</h3>
                                    <p className="text-xs text-primary-color font-semibold">{result.color} {result.fabric} Saree</p>
                                </div>
                                <button 
                                    onClick={() => handleGenerate()}
                                    className="btn btn-outline flex items-center gap-2"
                                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                >
                                    <RefreshCw size={14} /> Try Another Style
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="result-img aspect-[3/4] rounded-lg overflow-hidden border border-white/10" style={{ flex: '1' }}>
                                    <img src={getAssetUrl(result.image_url)} className="w-full h-full object-cover" alt="Result" />
                                </div>
                                <div className="flex-[0.6] flex flex-col justify-center gap-4">
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                        <h5 className="text-xs uppercase tracking-wider text-muted mb-2">Style Details</h5>
                                        <p className="text-sm m-0 leading-relaxed italic">"{result.style}"</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                        <h5 className="text-xs uppercase tracking-wider text-muted mb-2">AI Generation Prompt</h5>
                                        <p className="text-[11px] text-muted m-0 line-clamp-3">{result.prompt}</p>
                                    </div>
                                    <button className="btn btn-primary mt-auto" onClick={() => window.print()}>
                                        Save Look
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OccasionSuggestion;
