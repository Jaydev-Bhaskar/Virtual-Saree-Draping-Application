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
            <div className="relative">
               <Loader2 className="animate-spin text-primary-color" size={50} />
               <div className="absolute inset-0 bg-primary-color/10 rounded-full animate-ping"></div>
            </div>
            <p className="text-muted tracking-widest uppercase text-xs font-bold">Curating Your Fashion Showcase...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="glass-card border-danger-color/30 p-10 max-w-md">
                <h2 className="text-danger-color mb-4">Lookbook Private</h2>
                <p className="mb-6 opacity-70">This selection may have been deleted by the owner or the link has expired.</p>
                <Link to="/inventory" className="btn btn-primary">Discover New Styles</Link>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto py-12 px-6">
            <header className="text-center mb-20 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary-color/10 blur-[80px] rounded-full"></div>
                <span className="text-xs font-black text-primary-color uppercase tracking-[0.4em] mb-3 block">STYLE DOSSIER</span>
                <h1 className="text-6xl font-black mb-6 tracking-tight">{lookbook.title}</h1>
                <div className="flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-muted">
                    <span className="flex items-center gap-2 border-r border-white/10 pr-8"><Calendar size={14}/> {new Date(lookbook.created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                    <span className="flex items-center gap-2 text-primary-color"><Heart size={14}/> Verified Look</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-16">
                {lookbook.items.map((item, index) => (
                    <div key={item._id} className="group flex flex-col items-center animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-[#111] border border-white/5 aspect-[3/4.5]">
                            <img 
                                src={getAssetUrl(item.generated_image_url)} 
                                alt={item.clothing_name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-3xl font-black text-white mb-2 leading-tight uppercase italic tracking-tighter">{item.clothing_name}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-black italic">EST. ₹{item.clothing_info?.price?.toLocaleString() || 'N/A'}</span>
                                    <div className="flex gap-2">
                                        {item.clothing_info?.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] uppercase font-bold px-3 py-1 bg-white/10 rounded-full border border-white/20">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center max-w-sm px-4">
                           <p className="text-lg opacity-80 leading-relaxed font-serif italic mb-4">
                               "{item.clothing_info?.description || 'Sophistication and grace redefined in every thread and drape.'}"
                           </p>
                           <Link to="/inventory" className="text-xs font-bold text-primary-color hover:underline uppercase tracking-widest flex items-center justify-center gap-2">
                               View Collection <ExternalLink size={12}/>
                           </Link>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="mt-40 pt-20 border-t border-white/10">
                <div className="relative p-16 rounded-[3rem] overflow-hidden text-center bg-[#0d0d0d] border border-white/10 shadow-2xl">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-color/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black mb-4 italic tracking-tighter">INSPIRED BY THIS STYLE?</h3>
                        <p className="text-xl text-muted mb-10 max-w-xl mx-auto">Experience the future of fashion. Upload your photo and try on the entire collection in seconds.</p>
                        <Link to="/" className="btn btn-primary py-6 px-16 rounded-full font-black tracking-[0.2em] text-sm shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.5)] transition-all">
                            CREATE YOUR OWN LOOKBOOK
                        </Link>
                    </div>
                </div>
                <div className="mt-16 text-center opacity-20 text-[10px] font-black tracking-[0.6em] uppercase">
                    © 2026 VIRTUALFASHION AI • THE ART OF THE DRAPE
                </div>
            </footer>
        </div>
    );
};

export default Lookbook;
