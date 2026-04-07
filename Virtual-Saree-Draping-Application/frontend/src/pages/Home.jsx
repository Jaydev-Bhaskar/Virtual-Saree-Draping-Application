import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in text-center flex flex-col justify-center items-center" style={{ minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 className="mb-4">
          Experience Fashion with <br/>
          <span className="gradient-text">AI Virtual Try-On</span>
        </h1>
        <p className="mb-8" style={{ fontSize: '1.25rem', opacity: 0.8 }}>
          Discover how clothing looks on you instantly. Upload a photo, pick an outfit from our collection, and see the magic of AI technology unfold.
        </p>
        
        <div className="flex justify-center gap-6 mb-8">
          <NavLink to="/try-on" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            <Sparkles size={20} /> Try Now <ArrowRight size={20} />
          </NavLink>
          <NavLink to="/inventory" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Browse Collection
          </NavLink>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 p-8 glass-card">
          <div className="flex flex-col items-center">
            <div style={{ background: 'rgba(121, 40, 202, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
              <ImageIcon size={32} style={{ color: 'var(--primary-color)' }} />
            </div>
            <h3>1. Upload</h3>
            <p>Upload a clear photo of yourself looking straight ahead.</p>
          </div>
          <div className="flex flex-col items-center">
            <div style={{ background: 'rgba(255, 0, 128, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
              <Zap size={32} style={{ color: 'var(--secondary-color)' }} />
            </div>
            <h3>2. Select</h3>
            <p>Pick a beautiful saree or outfit from our digital wardrobe.</p>
          </div>
          <div className="flex flex-col items-center">
            <div style={{ background: 'rgba(82, 196, 26, 0.2)', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
              <Sparkles size={32} style={{ color: 'var(--success-color)' }} />
            </div>
            <h3>3. Generate</h3>
            <p>Watch as the AI beautifully drapes the saree onto your photo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
