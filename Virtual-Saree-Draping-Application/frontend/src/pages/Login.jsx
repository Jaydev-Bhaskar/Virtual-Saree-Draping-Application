import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { getApiUrl } from '../api';

const Login = () => {
  const [isSignUP, setIsSignUp] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let data;
      if (isSignUP) {
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        const response = await fetch(getApiUrl('/auth/signup'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            username: username,
            password: password
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          let msg = errData.detail;
          if (Array.isArray(msg)) {
            msg = msg.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
          }
          throw new Error(msg || 'Failed to create account.');
        }
        data = await response.json();
      } else {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const response = await fetch(getApiUrl('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });
        if (!response.ok) {
          const errData = await response.json();
          let msg = errData.detail;
          if (Array.isArray(msg)) {
            msg = msg.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ');
          }
          throw new Error(msg || 'Invalid email or password.');
        }
        data = await response.json();
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        role: data.role
      }));
      setSuccessMsg(isSignUP ? 'Account created!' : 'Welcome back!');
      setTimeout(() => {
        if (data.role === 'admin') navigate('/admin');
        else navigate('/inventory');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUP);
    setErrorMsg('');
    setSuccessMsg('');
  }

  return (
    <div className="animate-fade-in flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div className="text-center mb-8">
          <h2 className="gradient-text">{isSignUP ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignUP ? 'Join VirtualFashion to start trying on!' : 'Sign in to access your try-on studio'}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3 mb-2 rounded" style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(255, 77, 79, 0.3)' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 mb-2 rounded" style={{ backgroundColor: 'rgba(82, 196, 26, 0.1)', color: 'var(--success-color)', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
              {successMsg}
            </div>
          )}

          {isSignUP && (
            <div className="form-group mb-0 relative">
              <label className="form-label">Full Name</label>
              <div className="relative flex items-center">
                <User size={20} className="absolute left-3 text-muted" style={{ zIndex: 10, color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input pl-10" 
                  placeholder="John Doe" 
                  style={{ paddingLeft: '40px' }} 
                />
              </div>
            </div>
          )}

          <div className="form-group mb-0 relative">
            <label className="form-label">Email</label>
            <div className="relative flex items-center">
              <Mail size={20} className="absolute left-3 text-muted" style={{ zIndex: 10, color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-10" 
                placeholder="you@example.com" 
                style={{ paddingLeft: '40px' }} 
              />
            </div>
          </div>

          <div className="form-group mb-0 relative">
            <label className="form-label">Password</label>
            <div className="relative flex items-center">
              <Lock size={20} className="absolute left-3 text-muted" style={{ zIndex: 10, color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10" 
                placeholder="••••••••" 
                style={{ paddingLeft: '40px' }} 
              />
            </div>
            {isSignUP && <p className="text-[10px] text-muted m-0 mt-1">Minimum 8 characters required</p>}
          </div>

          {!isSignUP && (
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-4 flex items-center justify-center gap-2" style={{ width: '100%', padding: '14px' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUP ? 'Create Account' : 'Sign In')} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="mb-0">
            {isSignUP ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={toggleAuthMode}
              style={{ padding: '4px 12px', fontSize: '0.9rem', marginLeft: '8px', border: 'none', color: 'var(--secondary-color)' }}
            >
              {isSignUP ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
