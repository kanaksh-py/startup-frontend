import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.jsx';
import { Lock, Mail, Rocket } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);
            
            // Matches the new backend: { token, user: { id, role, profileId, ... } }
            const { token, user } = res.data;

            if (token && user?.profileId) {
                localStorage.setItem('token', token);
                localStorage.setItem('myStartupId', user.profileId);
                localStorage.setItem('userRole', user.role);
                
                // Force a small delay or window reload if your Navbar depends on localStorage
                window.location.href = '/feed';
            } else {
                setError("Session data missing from server response.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-startup-blue p-4 rounded-2xl mb-4 shadow-lg shadow-blue-100">
                        <Rocket className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your ecosystem account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Work Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                required
                                className="w-full p-3.5 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 focus:bg-white outline-none transition-all"
                                placeholder="name@company.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                            <input
                                type="password"
                                required
                                className="w-full p-3.5 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-startup-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-500 font-medium">
                    New here? <Link to="/register" className="text-startup-blue font-black hover:underline">Create an account</Link>
                </p>
            </div>
        </div>
    );
}