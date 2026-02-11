import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, Loader2, Rocket, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            
            // --- SYNCHRONIZED STORAGE PROTOCOL ---
            localStorage.setItem('token', res.data.token);
            
            // 1. Slug for Profile URLs
            localStorage.setItem('myStartupId', res.data.user.profileSlug);
            
            // 2. ObjectID for Chat Room Logic
            localStorage.setItem('myProfileId', res.data.user.profileId);
            
            localStorage.setItem('role', res.data.user.role);

            // Hard refresh to trigger Socket.io setup in App.jsx
            window.location.href = '/feed'; 
        } catch (err) {
            setError(err.response?.data?.message || "Authentication protocol failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-startup-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Rocket className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Welcome Back</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-startup-blue/20 transition-all font-bold"
                            placeholder="name@company.com"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-startup-blue/20 transition-all font-bold"
                            placeholder="••••••••"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Authorize Sync"}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/register" className="text-startup-blue font-black uppercase text-[10px] tracking-widest hover:underline">Initialize New Identity</Link>
                </div>
            </motion.div>
        </div>
    );
}