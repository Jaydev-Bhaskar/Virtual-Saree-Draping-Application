import React, { useState } from 'react';
import { Filter, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_ITEMS = [
  { id: 1, name: 'Crimson Banarasi Silk', price: '₹12,499', type: 'Saree', description: 'Experience the regal elegance of this authentic Crimson Banarasi Silk saree, featuring intricate gold zari work and a heavy border. Perfect for weddings and grand festive occasions.', img: '/images/crimson_banarasi.png' },
  { id: 2, name: 'Royal Blue Kanjivaram', price: '₹18,999', type: 'Saree', description: 'A masterpiece from Kanchipuram, this Royal Blue Kanjivaram silk saree boasts pure mulberry silk with traditional temple motifs woven in stunning silver and gold zari.', img: '/images/royal_blue_kanjivaram.png' },
  { id: 3, name: 'Emerald Organza', price: '₹8,599', type: 'Saree', description: 'Lightweight, sheer, and incredibly graceful. This Emerald Green Organza saree features delicate floral embroidery, making it a modern favorite for evening parties.', img: '/images/emerald_organza.png' },
  { id: 4, name: 'Lavender Chiffon', price: '₹6,499', type: 'Saree', description: 'Fluid and romantic, this Lavender Chiffon saree drapes beautifully around your silhouette. Finished with a minimalist sequin border for subtle nighttime glamour.', img: '/images/lavender_chiffon.png' },
  { id: 5, name: 'Golden Georgette', price: '₹9,999', type: 'Saree', description: 'Rich Golden Georgette fabric that offers effortless drape and subtle sheen. Handcrafted with meticulous gota patti work for a luxurious festive touch.', img: '/images/golden_georgette.png' },
  { id: 6, name: 'Magenta Silk', price: '₹14,999', type: 'Saree', description: 'A vibrant Magenta pure silk drape that commands attention. Featuring an elaborate woven pallu and a classic smooth finish for traditional celebrations.', img: '/images/magenta_silk.png' },
];

const Inventory = () => {
  const navigate = useNavigate();
  const [selectedDetails, setSelectedDetails] = useState(null);

  return (
    <div className="animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <h2>Apparel <span className="gradient-text">Collection</span></h2>
        <button className="btn btn-outline"><Filter size={18} /> Filters</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {MOCK_ITEMS.map((item) => (
          <div key={item.id} className="glass-card flex flex-col p-4">
            <div className="img-wrapper mb-4" style={{ height: '350px' }}>
              <img src={item.img} alt={item.name} style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.type}</p>
              </div>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.price}</span>
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
                onClick={() => navigate('/try-on', { state: { selectedSaree: item } })}
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
              <img src={selectedDetails.img} alt={selectedDetails.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="gradient-text mb-2">{selectedDetails.name}</h2>
              <p style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{selectedDetails.price}</p>
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
