import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ExternalLink, Calendar, Heart, ShoppingBag } from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../api';

const Lookbook = () => {
    const { shareId } = useParams();
    const [lookbook, setLookbook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLookbook = async () => {
            try {
                const response = await fetch(getApiUrl(`/lookbook/${shareId}`));
                if (!response.ok) throw new Error("Lookbook not found or expired");
                const data = await response.json();
                setLookbook(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLookbook();
    }, [shareId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-primary-color" size={50} />
            <p className="text-muted tracking-widest uppercase text-sm">Loading Curated Lookbook...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="glass-card border-danger-color/30 p-10 max-w-md">
                <h2 className="text-danger-color mb-4">Oops!</h2>
                <p className="mb-6">{error}</p>
                <Link to="/inventory" className="btn btn-primary">Browse Collection</Link>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto py-10 px-4">
            <header className="text-center mb-16">
                <span className="text-xs font-bold text-primary-color uppercase tracking-widest mb-2 block">Personal Style Showcase</span>
                <h1 className="text-5xl font-black mb-4">{lookbook.title}</h1>
                <div className="flex items-center justify-center gap-6 text-muted text-sm">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(lookbook.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Heart size={14}/> Verified Lookbook</span>
                    <span className="flex items-center gap-1"><ExternalLink size={14}/> Public Access</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {lookbook.items.map((item, index) => (
                    <div key={item._id} className="group flex flex-col animate-scale-in" style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl aspect-[3/4] group-hover:transform group-hover:scale-[1.02] transition-all duration-500">
                            <img 
                                src={getAssetUrl(item.generated_image_url)} 
                                alt={item.clothing_name} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-1">{item.clothing_name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary-color font-bold">₹{item.clothing_info?.price?.toLocaleString() || 'N/A'}</span>
                                    <Link to="/inventory" className="text-white text-xs underline hover:text-primary-color">Shop Similar</Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-2">
                           <div className="flex items-center justify-between mb-3">
                               <div className="flex gap-1.5 flex-wrap">
                                   {item.clothing_info?.tags?.slice(0, 3).map(tag => (
                                       <span key={tag} className="text-[10px] uppercase font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10 tracking-wider">{tag}</span>
                                   ))}
                               </div>
                               <button className="text-muted hover:text-primary-color transition-colors"><Heart size={18} /></button>
                           </div>
                           <p className="text-sm opacity-60 line-clamp-2 italic leading-relaxed">
                               "{item.clothing_info?.description || 'A stunning piece crafted for elegance and style.'}"
                           </p>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="mt-24 pt-16 border-t border-white/10 text-center">
                <div className="glass-card max-w-2xl mx-auto p-10 bg-primary-color/5 border-primary-color/20">
                    <h3 className="text-2xl mb-4">Want to create your own Lookbook?</h3>
                    <p className="text-muted mb-8 text-lg">Use our AI-powered virtual try-on technology to see how any saree looks on you instantly.</p>
                    <Link to="/login" className="btn btn-primary py-4 px-10 rounded-full font-bold tracking-widest text-sm">GET STARTED FOR FREE</Link>
                </div>
                <div className="mt-12 opacity-30 text-xs tracking-[0.3em] uppercase">
                    POWERED BY VIRTUALFASHION AI
                </div>
            </footer>
        </div>
    );
};

export default Lookbook;
