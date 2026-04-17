import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getApiUrl, getAssetUrl } from '../api';
import { MessageSquare, Star, Filter, Loader2, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [clothingMap, setClothingMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, critical (1-2), praise (4-5)

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                // 1. Fetch Feedback
                const fbRes = await fetch(getApiUrl('/feedback/all/console'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const fbData = await fbRes.json();
                
                // 2. Fetch Clothing for Name mapping
                const clRes = await fetch(getApiUrl('/clothing/'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const clData = await clRes.json();
                const cmap = {};
                (clData.items || []).forEach(item => {
                    cmap[item.id] = item;
                });
                
                setFeedbacks(fbData || []);
                setClothingMap(cmap);
            } catch (err) {
                console.error("Failed to load feedback center", err);
            } finally {
                setLoading(false);
            }
        };
        loadPage();
    }, []);

    const filteredFeedbacks = feedbacks.filter(fb => {
        if (filter === 'critical') return fb.rating <= 2;
        if (filter === 'praise') return fb.rating >= 4;
        return true;
    });

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={14} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-white/10"} 
                    />
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary-color" size={48} />
            <p className="text-muted">Analyzing Customer Sentiment...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <NavLink to="/admin" className="btn btn-outline" style={{ padding: '8px' }}><ArrowLeft size={18}/></NavLink>
                    <div>
                        <h2 className="m-0 flex items-center gap-3">
                            <MessageSquare className="text-primary-color" /> 
                            <span className="gradient-text">Feedback Review</span> Console
                        </h2>
                        <p className="text-muted m-0">Monitor user satisfaction and catalog quality</p>
                    </div>
                </div>
                
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    {['all', 'critical', 'praise'].map(f => (
                        <button 
                            key={f}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition cursor-pointer border-none uppercase ${filter === f ? 'bg-primary-color text-white' : 'text-muted bg-transparent hover:text-white'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card p-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {filteredFeedbacks.length === 0 ? (
                    <div className="p-20 text-center text-muted">No feedback found for this filter.</div>
                ) : (
                    <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr className="text-[10px] font-black text-muted uppercase tracking-widest">
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Target Saree</th>
                                <th className="px-4 py-2">Rating</th>
                                <th className="px-4 py-2" style={{ minWidth: '300px' }}>User Comment</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.map((fb) => (
                                <tr key={fb.id} className="group hover:bg-white/5 transition rounded-lg overflow-hidden">
                                    <td className="px-4 py-4 text-xs opacity-50">
                                        {new Date(fb.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary-color/20 flex items-center justify-center text-[10px] font-bold text-primary-color">
                                                {fb.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-white">{fb.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {clothingMap[fb.clothing_id] ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-10 rounded border border-white/10 overflow-hidden bg-black/40">
                                                    <img src={getAssetUrl(clothingMap[fb.clothing_id].image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <span className="text-xs">{clothingMap[fb.clothing_id].name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] opacity-40">Item Deleted</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {renderStars(fb.rating)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-white/80 italic">
                                        "{fb.comment || 'No comment provided'}"
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-muted hover:text-red-400 transition bg-transparent border-none cursor-pointer p-2">
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Insight Summary */}
            <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="glass-card p-6 border-green-500/20 bg-green-500/5">
                    <h4 className="m-0 text-[10px] font-black uppercase text-green-400 tracking-widest mb-1">Total Reviews</h4>
                    <span className="text-3xl font-black text-white">{feedbacks.length}</span>
                </div>
                <div className="glass-card p-6 border-yellow-500/20 bg-yellow-500/5">
                    <h4 className="m-0 text-[10px] font-black uppercase text-yellow-400 tracking-widest mb-1">Avg Rating</h4>
                    <span className="text-3xl font-black text-white">
                        {(feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length || 0).toFixed(1)}
                    </span>
                </div>
                <div className="glass-card p-6 border-primary-color/20 bg-primary-color/5">
                    <h4 className="m-0 text-[10px] font-black uppercase text-primary-color tracking-widest mb-1">Critical Issues</h4>
                    <span className="text-3xl font-black text-white">
                        {feedbacks.filter(f => f.rating <= 2).length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminFeedback;
