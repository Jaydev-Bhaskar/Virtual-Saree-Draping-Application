import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, X, Check, Loader2, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getApiUrl, getAssetUrl } from '../api';

const AdminInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        color: '',
        type: 'saree',
        occasion: 'party',
        description: '',
        brand: 'Ethnika',
        tags: 'silk, traditional'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('/clothing/'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setItems(data.items || []);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required");
            if (!selectedFile) throw new Error("Please select a saree image first");
            
            // 1. Create metadata
            const response = await fetch(getApiUrl('/clothing/'), {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newItem,
                    price: parseFloat(newItem.price),
                    tags: newItem.tags.split(',').map(t => t.trim())
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to create item metadata");
            }
            const itemData = await response.json();

            // 2. Upload image
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            const imgRes = await fetch(getApiUrl(`/clothing/${itemData.id}/image`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!imgRes.ok) throw new Error("Metadata created but image upload failed.");

            setShowAddModal(false);
            fetchItems();
            setNewItem({ name: '', price: '', color: '', type: 'saree', occasion: 'party', description: '', brand: 'Ethnika', tags: '' });
            setSelectedFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl(`/clothing/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchItems();
            else {
                const err = await res.json();
                alert(err.detail || "Delete failed");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary-color" size={48} />
            <p className="text-muted">Loading Collection Management...</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="m-0">Manage <span className="gradient-text">Collection</span></h2>
                    <p className="text-muted m-0">Add or remove sarees from the digital inventory</p>
                </div>
                <div className="flex gap-4">
                    <NavLink to="/admin/dashboard" className="btn btn-outline flex items-center gap-2">
                        <LayoutDashboard size={20} /> View Analytics
                    </NavLink>
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
                        <Plus size={20} /> Add New Saree
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.length === 0 ? (
                    <div className="glass-card p-12 text-center text-muted">
                        No items in collection. Click "Add New Saree" to start.
                    </div>
                ) : items.map((item) => (
                    <div key={item.id} className="glass-card flex items-center p-4 gap-6">
                        <div style={{ width: '80px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#222' }}>
                            <img 
                                src={getAssetUrl(item.image_url)} 
                                alt={item.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/80x100?text=No+Img'}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="flex items-center gap-3">
                                <h3 className="m-0" style={{ fontSize: '1.2rem' }}>{item.name}</h3>
                                <span className="badge" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{item.brand}</span>
                            </div>
                            <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                                {item.color} • ₹{item.price.toLocaleString()} • {item.occasion}
                            </p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.description}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-outline" style={{ padding: '8px' }} title="Edit"><Edit2 size={16} /></button>
                            <button className="btn btn-outline" style={{ padding: '8px', color: '#ff4444' }} onClick={() => handleDelete(item.id)} title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card animate-scale-in" style={{ width: '550px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }} onMouseOver={e=>e.target.style.opacity=1} onMouseOut={e=>e.target.style.opacity=0.5}>
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <h2 className="m-0 gradient-text">Add New Saree</h2>
                            <p className="text-muted m-0">Fill in the details to expand your catalog</p>
                        </div>
                        
                        <form onSubmit={handleAddItem} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Saree Name</label>
                                <input className="input" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Royal Blue Kanjeevaram Silk" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Price (₹)</label>
                                    <input className="input" type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="15000" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Primary Color</label>
                                    <input className="input" required value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})} placeholder="Blue / Red / Gold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Brand / Collection</label>
                                    <input className="input" required value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} placeholder="Ethnika" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Occasion</label>
                                    <select className="input" value={newItem.occasion} onChange={e => setNewItem({...newItem, occasion: e.target.value})}>
                                        <option value="party">Party Wear</option>
                                        <option value="wedding">Wedding / Bridal</option>
                                        <option value="casual">Casual / Daily</option>
                                        <option value="festive">Festive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Description</label>
                                <textarea className="input" style={{ height: '80px', padding: '0.75rem', resize: 'none' }} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Describe the fabric, borders, and craftsmanship..." />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Saree Image (Full Front View)</label>
                                <div 
                                    className="input flex items-center justify-center cursor-pointer" 
                                    style={{ height: '120px', borderStyle: 'dashed', background: 'rgba(255,255,255,0.03)', borderColor: selectedFile ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)' }}
                                    onClick={() => document.getElementById('saree-upload').click()}
                                >
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center gap-1 text-primary-color animate-fade-in">
                                            <Check size={28}/> 
                                            <span style={{ fontSize: '0.8rem' }}>{selectedFile.name} Selected</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-muted gap-2">
                                            <Upload size={28}/> 
                                            <span style={{ fontSize: '0.9rem' }}>Click to upload front-facing saree image</span>
                                        </div>
                                    )}
                                    <input id="saree-upload" type="file" hidden onChange={e => setSelectedFile(e.target.files[0])} accept="image/*" />
                                </div>
                            </div>

                            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm text-center">{error}</div>}

                            <button className="btn btn-primary w-full mt-2 py-3" disabled={uploading}>
                                {uploading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={20} /> Updating Inventory...
                                    </div>
                                ) : 'Add to Collection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
