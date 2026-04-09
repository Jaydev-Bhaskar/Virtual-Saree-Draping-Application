import React, { useState, useEffect } from 'react';
import { History, LayoutDashboard, Settings, LogOut, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_HISTORY = [
  { id: 1, name: 'Crimson Banarasi Silk', date: 'Oct 20, 2023', price: '₹12,499', type: 'Saree', description: 'Experience the regal elegance of this authentic Crimson Banarasi Silk saree, featuring intricate gold zari work and a heavy border.', img: '/images/crimson_banarasi.png' },
  { id: 2, name: 'Royal Blue Kanjivaram', date: 'Oct 19, 2023', price: '₹18,999', type: 'Saree', description: 'A masterpiece from Kanchipuram, this Royal Blue Kanjivaram silk saree boasts pure mulberry silk with traditional temple motifs.', img: '/images/royal_blue_kanjivaram.png' },
  { id: 3, name: 'Golden Georgette', date: 'Oct 18, 2023', price: '₹9,999', type: 'Saree', description: 'Rich Golden Georgette fabric that offers effortless drape and subtle sheen. Handcrafted with meticulous gota patti work.', img: '/images/golden_georgette.png' },
];

const Dashboard = () => {
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [user, setUser] = useState({ username: 'User', email: 'user@example.com' });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser && savedUser.username) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Ensure state is cleared across app
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

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
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={18}/> Overview</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}><History size={18}/> Try-On History</button>
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
        <h2 className="mb-6">Recent <span className="gradient-text">Activity</span></h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <h3>12</h3>
            <p className="mb-0">Outfits Tried</p>
          </div>
          <div className="glass-card">
            <h3>4</h3>
            <p className="mb-0">Saved Looks</p>
          </div>
          <div className="glass-card">
            <h3>2</h3>
            <p className="mb-0">New Recommendations</p>
          </div>
        </div>

        <h3>Your Recent Try-Ons</h3>
        <div className="grid grid-cols-3 gap-6 mt-4">
          {MOCK_HISTORY.map((item) => (
            <div key={item.id} className="glass-card flex flex-col p-4 shadow-sm">
              <div className="img-wrapper mb-4" style={{ height: '200px' }}>
                 <img src={item.img} alt={item.name} style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
              </div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{item.name}</p>
              <p style={{ marginBottom: '8px', fontSize: '0.9rem', opacity: 0.7 }}>{item.date}</p>
              <button 
                className="btn btn-outline" 
                style={{ padding: '8px' }}
                onClick={() => setSelectedDetails(item)}
              >
                View Detail
              </button>
            </div>
          ))}
        </div>
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
              <img src={selectedDetails.img} alt={selectedDetails.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>History Entry</p>
              <h2 className="gradient-text mb-2" style={{ fontSize: '2rem' }}>{selectedDetails.name}</h2>
              <p style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{selectedDetails.price}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', borderLeft: '3px solid var(--primary-color)' }}>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedDetails.description}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>Tried on: {selectedDetails.date}</p>
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

