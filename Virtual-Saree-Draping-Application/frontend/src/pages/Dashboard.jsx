import React, { useState, useEffect } from 'react';
import { History, LayoutDashboard, Settings, LogOut, X, ShoppingBag, Share2, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getAssetUrl } from '../api';

const MOCK_HISTORY = [
  { id: 1, name: 'Crimson Banarasi Silk', date: 'Oct 20, 2023', price: '₹12,499', type: 'Saree', description: 'Experience the regal elegance of this authentic Crimson Banarasi Silk saree, featuring intricate gold zari work and a heavy border.', img: '/images/crimson_banarasi.png' },
  { id: 2, name: 'Royal Blue Kanjivaram', date: 'Oct 19, 2023', price: '₹18,999', type: 'Saree', description: 'A masterpiece from Kanchipuram, this Royal Blue Kanjivaram silk saree boasts pure mulberry silk with traditional temple motifs.', img: '/images/royal_blue_kanjivaram.png' },
  { id: 3, name: 'Golden Georgette', date: 'Oct 18, 2023', price: '₹9,999', type: 'Saree', description: 'Rich Golden Georgette fabric that offers effortless drape and subtle sheen. Handcrafted with meticulous gota patti work.', img: '/images/golden_georgette.png' },
];

const Dashboard = () => {
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [user, setUser] = useState({ username: 'User', email: 'user@example.com' });
  const [history, setHistory] = useState([]);
  const [recommendationsCount, setRecommendationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedForLookbook, setSelectedForLookbook] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [isCreatingLookbook, setIsCreatingLookbook] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser && savedUser.username) {
      setUser(savedUser);
    }
    Promise.all([fetchHistory(), fetchRecommendations()]);
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/try-on/history'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      const flatHistory = [];
      if (Array.isArray(data)) {
          data.forEach(item => {
              const baseInfo = {
                  session_id: item.id || item._id,
                  created_at: item.created_at,
                  user_image_url: item.user_image_url
              };

              if (item.results && Array.isArray(item.results)) {
                  item.results.forEach(res => {
                      flatHistory.push({ ...baseInfo, ...res, id: res.id || res.clothing_id || Math.random() });
                  });
              } else if (item.details) {
                  flatHistory.push({ 
                      ...baseInfo, 
                      ...item.details, 
                      generated_image_url: item.details.image_url,
                      clothing_name: item.details.style || item.details.name,
                      id: item.id || item._id 
                  });
              } else if (item.generated_image_url) {
                  flatHistory.push({ ...baseInfo, ...item, id: item.id || item._id });
              }
          });
      }
      setHistory(flatHistory);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(getApiUrl('/recommendations/latest'), {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setRecommendationsCount(data.length || 0);
      } catch (err) {
          setRecommendationsCount(0);
      }
  };

  const toggleLookbookItem = (id) => {
    setSelectedForLookbook(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateLookbook = async () => {
    if (selectedForLookbook.length === 0) return;
    setIsCreatingLookbook(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/lookbook/'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result_ids: selectedForLookbook,
          title: `${user.username}'s Curated Lookbook`
        })
      });
      const data = await response.json();
      setShareLink(window.location.origin + data.share_url);
    } catch (err) {
      console.error("Lookbook creation failed", err);
    } finally {
      setIsCreatingLookbook(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="animate-fade-in grid grid-cols-4 gap-8 relative">
      {/* Sidebar */}
      <div className="col-span-1 glass-card" style={{ padding: '0', height: 'fit-content' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
            {getInitials(user.full_name || user.username)}
          </div>
          <h3 style={{ margin: 0 }}>{user.full_name || user.username}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{user.email}</p>
        </div>
        <div className="flex flex-col p-4 gap-2">
          {selectedForLookbook.length > 0 && (
              <button 
                className="btn btn-primary mb-2 flex flex-col gap-1 items-center py-4" 
                onClick={handleCreateLookbook}
                disabled={isCreatingLookbook}
              >
                  <Share2 size={18} />
                  <span>Share {selectedForLookbook.length} Selected Looks</span>
              </button>
          )}
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}><LayoutDashboard size={18}/> Overview</button>
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><History size={18}/> Try-On History</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}><Settings size={18}/> Settings</button>
          <button 
            className="btn btn-outline text-danger-color mt-4 logout-btn" 
            style={{ justifyContent: 'flex-start', border: 'none', color: 'var(--danger-color)' }}
            onClick={handleLogout}
          >
            <LogOut size={18}/> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-3">
        {shareLink && (
            <div className="glass-card mb-8 border-primary-color animate-scale-in flex items-center justify-between p-4" style={{ background: 'rgba(var(--primary-rgb), 0.1)' }}>
                <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold text-primary-color mb-1">Your lookbook is live!</span>
                    <code className="text-sm opacity-80">{shareLink}</code>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => {navigator.clipboard.writeText(shareLink); alert('Copied!')}}>Copy Link</button>
            </div>
        )}

        <h2 className="mb-6">Virtual <span className="gradient-text">Lookbook</span></h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <h3>{history.length}</h3>
            <p className="mb-0">Outfits Tried</p>
          </div>
          <div className="glass-card">
            <h3>{selectedForLookbook.length}</h3>
            <p className="mb-0">Selected for Sharing</p>
          </div>
          <div className="glass-card">
            <h3>{recommendationsCount}</h3>
            <p className="mb-0">AI Recommendations</p>
          </div>
        </div>

        <h3>Your Recent Try-Ons</h3>
        <p className="text-muted mb-4">Select the looks you want to share with friends.</p>

        {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin text-primary-color mx-auto" size={40}/></div>
        ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted">No try-on history found. Visit the collection to start!</div>
        ) : (
            <div className="grid grid-cols-3 gap-6 mt-4">
              {history.map((item) => (
                <div 
                    key={item.id || item._id} 
                    className={`glass-card flex flex-col p-4 shadow-sm cursor-pointer transition-all ${selectedForLookbook.includes(item.id || item._id) ? 'border-primary-color ring-2 ring-primary-color/20 ring-offset-2 ring-offset-transparent' : 'hover:border-primary-color/50'}`}
                    onClick={() => toggleLookbookItem(item.id || item._id)}
                >
                  <div className="img-wrapper mb-4 relative" style={{ height: '220px' }}>
                     <img src={getAssetUrl(item.generated_image_url || item.img)} alt={item.clothing_name} style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
                     <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedForLookbook.includes(item.id || item._id) ? 'bg-primary-color border-primary-color' : 'bg-black/20 border-white/50'}`}>
                         {selectedForLookbook.includes(item.id || item._id) && <Check size={14} className="text-white" />}
                     </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{item.clothing_name || item.name}</p>
                    <span className="text-xs opacity-60">Saree</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                      <button 
                        className="btn btn-outline flex-1 py-1.5 text-xs" 
                        onClick={(e) => {e.stopPropagation(); setSelectedDetails(item)}}
                      >
                        Detail
                      </button>
                      <button 
                        className="btn btn-primary flex-1 py-1.5 text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/try-on', { state: { selectedSaree: item.clothing_info || item } });
                        }}
                      >
                        Try Again
                      </button>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card flex gap-8 animate-fade-in" style={{ maxWidth: '900px', width: '90%', position: 'relative', padding: '2.5rem', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setSelectedDetails(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ flex: '1.2', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <img src={getAssetUrl(selectedDetails.generated_image_url || selectedDetails.img)} alt={selectedDetails.clothing_name || selectedDetails.name} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }} />
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>History Entry</p>
              <h2 className="gradient-text mb-2" style={{ fontSize: '2rem' }}>{selectedDetails.clothing_name || selectedDetails.name || 'Saved Look'}</h2>
              <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{selectedDetails.clothing_info?.price || selectedDetails.price || 'Priceless Look'}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', borderLeft: '3px solid var(--primary-color)' }}>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedDetails.description || 'You created this custom look using the Virtual Draping Studio.'}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>Tried on: {selectedDetails.date || new Date(selectedDetails.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSelectedDetails(null);
                    navigate('/try-on', { state: { selectedSaree: selectedDetails } });
                  }}
                >
                  Try Again
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }}>Download Result</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

