import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, User, Image as ImageIcon, Box, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
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
        <NavLink to="/try-on" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
          <ImageIcon size={18} /> Try On
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
      </div>

      <div className="flex gap-4">
        <NavLink to="/login" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }}>
          <User size={18} /> Sign In
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
