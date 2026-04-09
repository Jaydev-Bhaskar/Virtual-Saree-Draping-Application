import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '../api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);

            const response = await fetch(getApiUrl('/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Invalid Admin Credentials');
            }

            const data = await response.json();
            
            // Critical: Verify if this is actually an admin
            if (data.role !== 'admin') {
                throw new Error('Access Denied: This portal is for Administrators only.');
            }

            // Store info and redirect to management
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
                full_name: data.full_name,
                email: data.email,
                role: data.role
            }));

            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
            <div className="glass-card p-10 w-full max-w-md relative overflow-hidden">
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: 'var(--primary-color)', opacity: 0.1 }}>
                    <ShieldCheck size={120} />
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-color/10 text-primary-color mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="m-0 gradient-text">Admin Portal</h2>
                    <p className="text-muted m-0">Secure Management Access</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Admin Email</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><User size={18} /></span>
                            <input 
                                className="input" 
                                style={{ paddingLeft: '2.8rem' }}
                                type="email" 
                                required 
                                value={credentials.email}
                                onChange={e => setCredentials({...credentials, email: e.target.value})}
                                placeholder="admin@ethnika.com"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Security Key</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Lock size={18} /></span>
                            <input 
                                className="input" 
                                style={{ paddingLeft: '2.8rem' }}
                                type="password" 
                                required 
                                value={credentials.password}
                                onChange={e => setCredentials({...credentials, password: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button className="btn btn-primary py-3 flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
                    </button>

                    <button 
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-muted hover:text-white transition-colors text-sm flex items-center justify-center gap-2 bg-transparent border-none cursor-pointer mt-2"
                    >
                        <ArrowLeft size={16} /> Back to User Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
