import React from 'react';
import { History, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="animate-fade-in grid grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="col-span-1 glass-card" style={{ padding: '0', height: 'fit-content' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
            JD
          </div>
          <h3 style={{ margin: 0 }}>John Doe</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>john.doe@example.com</p>
        </div>
        <div className="flex flex-col p-4 gap-2">
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={18}/> Overview</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}><History size={18}/> Try-On History</button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}><Settings size={18}/> Settings</button>
          <button className="btn btn-outline text-danger-color mt-4" style={{ justifyContent: 'flex-start', border: 'none', color: 'var(--danger-color)' }}><LogOut size={18}/> Logout</button>
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
          {[
            "/images/crimson_banarasi.png",
            "/images/royal_blue_kanjivaram.png",
            "/images/golden_georgette.png"
          ].map((src, idx) => (
            <div key={idx} className="glass-card flex flex-col p-4 shadow-sm">
              <div className="img-wrapper mb-4" style={{ height: '200px' }}>
                 <img src={src} alt="History" style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
              </div>
              <p style={{ marginBottom: '8px', fontSize: '0.9rem' }}>Oct {20 - idx}, 2023</p>
              <button className="btn btn-outline" style={{ padding: '8px' }}>View Detail</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
