import React, { useState, useEffect } from 'react';
import { Filter, ShoppingBag, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getAssetUrl } from '../api';

const Inventory = () => {
  const navigate = useNavigate();
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/clothing/'), {
          headers: { 
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
            console.error(`Error: ${response.status}`);
            setItems([]);
            return;
        }

        const data = await response.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("Fetch failed", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  const getImageUrl = (url) => getAssetUrl(url);

  // High-performance filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOccasion = selectedOccasion === 'all' || item.occasion?.toLowerCase() === selectedOccasion.toLowerCase();
    
    // Color filtering (case-insensitive and handles multiple words)
    const matchesColor = selectedColor === 'all' || 
                         (item.color && item.color.toLowerCase().split(/[ /]/).includes(selectedColor.toLowerCase()));
    
    return matchesSearch && matchesOccasion && matchesColor;
  });

  // Extract unique colors for the filter dropdown
  const uniqueColors = ['all', ...new Set(items.map(item => item.color?.split(/[ /]/)[0].toLowerCase()).filter(Boolean))];

  return (
    <div className="animate-fade-in relative">
      {/* Original Header Style */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="m-0">Apparel <span className="gradient-text">Collection</span></h2>
        <div className="flex gap-4">
             {/* Search is now a subtle part of the original header */}
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search saree..." 
                    className="form-input py-1.5 px-4" 
                    style={{ width: '150px', borderRadius: '4px', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
                className={`btn btn-outline flex items-center gap-2 ${showFilters ? 'bg-primary-color border-primary-color text-white' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={18} /> Filters
            </button>
        </div>
      </div>

      {/* Subtle Filter Options (Appears only when clicked) */}
      {showFilters && (
          <div className="glass-card p-4 mb-6 animate-slide-down flex items-center gap-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                  <span className="text-xs uppercase text-muted">Occasion:</span>
                  <select 
                    className="form-input py-1" 
                    style={{ width: '150px', fontSize: '0.8rem' }}
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                  >
                      <option value="all">All</option>
                      <option value="wedding">Wedding</option>
                      <option value="party">Party</option>
                      <option value="casual">Casual</option>
                  </select>
              </div>

              <div className="flex items-center gap-3">
                  <span className="text-xs uppercase text-muted">Color:</span>
                  <select 
                    className="form-input py-1" 
                    style={{ width: '120px', fontSize: '0.8rem' }}
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                      <option value="all">All</option>
                      {uniqueColors.filter(c => c !== 'all').map(color => (
                          <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                      ))}
                  </select>
              </div>

              <button 
                className="text-xs text-muted hover:text-white"
                onClick={() => {
                    setSearchQuery('');
                    setSelectedOccasion('all');
                    setSelectedColor('all');
                }}
              >
                  Clear
              </button>
          </div>
      )}

      {/* Restore the exact original 3-column grid */}
      <div className="grid grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-3 py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary-color" size={48} />
              <p>Fetching curated collection...</p>
           </div>
        ) : filteredItems.length === 0 ? (
            <div className="col-span-3 py-20 text-center glass-card">
                <p className="text-muted">No sarees match your filters.</p>
            </div>
        ) : filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="glass-card flex flex-col p-4 cursor-pointer hover:border-primary-color transition"
            onClick={() => setSelectedDetails(item)}
          >
            <div className="img-wrapper mb-4" style={{ height: '350px' }}>
              <img src={getImageUrl(item.image_url)} alt={item.name} style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.type}</p>
              </div>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{typeof item.price === 'string' ? item.price : `₹${item.price.toLocaleString()}`}</span>
            </div>
            <div className="flex gap-2 w-full mt-auto">
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setSelectedDetails(item)}
              >
                <ShoppingBag size={16} /> Details
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/try-on', { state: { selectedSaree: item } });
                }}
              >
                Try On
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card flex gap-6 animate-fade-in" style={{ maxWidth: '800px', width: '90%', position: 'relative', padding: '2rem' }}>
            <button 
              onClick={() => setSelectedDetails(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <div style={{ flex: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '400px' }}>
              <img src={getImageUrl(selectedDetails.image_url)} alt={selectedDetails.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="gradient-text mb-2">{selectedDetails.name}</h2>
              <p style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{typeof selectedDetails.price === 'string' ? selectedDetails.price : `₹${selectedDetails.price.toLocaleString()}`}</p>
              <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6' }}>{selectedDetails.description}</p>
              </div>
              <button 
                className="btn btn-primary w-full"
                onClick={() => {
                  setSelectedDetails(null);
                  navigate('/try-on', { state: { selectedSaree: selectedDetails } });
                }}
              >
                Try On This Saree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
