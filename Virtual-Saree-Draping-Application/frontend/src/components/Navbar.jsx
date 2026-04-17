import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, User, Image as ImageIcon, Box, LayoutDashboard, Plus, Lock, Sparkles, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    // Listen for login/logout events across the app
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem('user') || '{}'));
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom interval check for same-tab updates
        const interval = setInterval(handleStorageChange, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const isAdmin = user.role === 'admin';
    const isLoggedIn = !!user.email;

    return (
        <nav className="navbar glass">
            <div className="flex items-center gap-4">
                <Layers className="text-secondary-color" size={28} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    VirtualFashion
                </span>
            </div>
            
            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
                    Home
                </NavLink>
                <NavLink to="/inventory" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
                    <Box size={18} /> Collection
                </NavLink>
                
                {isLoggedIn && (
                    <>
                        <NavLink to="/try-on" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
                            <ImageIcon size={18} /> Virtual Try-On
                        </NavLink>
                        
                        {isAdmin ? (
                            <>
                                <NavLink to="/admin" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`} style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                                    <Plus size={18} /> Add Saree
                                </NavLink>
                                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                    <LayoutDashboard size={18} /> Analytics
                                </NavLink>
                                <NavLink to="/admin/feedback" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`} style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                    <MessageSquare size={18} /> Feedbacks
                                </NavLink>
                            </>
                        ) : (
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard size={18} /> My Dashboard
                            </NavLink>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-3">
                {isLoggedIn ? (
                    <div className="flex items-center gap-4" style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3">
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
                                    {user.full_name || user.email.split('@')[0]}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--primary-color)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="btn btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'transparent', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Lock size={14} /> Logout
                        </button>
                    </div>
                ) : (
                    <NavLink to="/login" className="btn btn-primary flex items-center gap-2">
                        <User size={18} /> Sign In
                    </NavLink>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
