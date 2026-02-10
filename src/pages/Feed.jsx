import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Globe, Image as ImageIcon, X, MessageSquare, Zap, Activity, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(null);
    const [newPost, setNewPost] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' }); // Custom Alert State
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [feedRes, statusRes] = await Promise.all([
                api.get('/myfeed/feed'),
                api.get('/auth/status')
            ]);
            setPosts(feedRes.data.data || []);
            setStatus(statusRes.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setIsPosting(true);
        try {
            await api.post('/posts', { content: newPost, image: image });
            setNewPost('');
            setImage(null);
            setPreview('');
            await fetchData();
        } catch (err) {
            // Trigger Custom UI Alert instead of browser alert
            setErrorModal({ 
                show: true, 
                message: err.response?.data?.message || "Action failed" 
            });
        } finally {
            setIsPosting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-startup-blue/20 border-t-startup-blue rounded-full animate-spin" />
                <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Loading Network</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* PREMIUM CUSTOM ALERT MODAL */}
            <AnimatePresence>
                {errorModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-red-100 text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Wait a moment</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{errorModal.message}</p>
                            <button 
                                onClick={() => setErrorModal({ show: false, message: '' })}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors"
                            >
                                Understood
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
                {/* Create Post Box */}
                {status?.role === 'startup' && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 mb-12">
                        <form onSubmit={handlePostSubmit}>
                            <textarea
                                className="w-full p-6 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-startup-blue/20 focus:ring-4 focus:ring-startup-blue/5 outline-none resize-none h-36 text-lg transition-all font-medium placeholder:text-gray-300"
                                placeholder="What milestone did you hit this week?"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                disabled={isPosting}
                            />
                            
                            <AnimatePresence>
                                {preview && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="relative mt-6 rounded-3xl overflow-hidden border-4 border-white shadow-xl"
                                    >
                                        <img src={preview} alt="Preview" className="w-full h-72 object-cover" />
                                        {!isPosting && (
                                            <button 
                                                type="button"
                                                onClick={() => {setPreview(''); setImage(null);}}
                                                className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-black transition-all"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-50">
                                <label className={`flex items-center gap-4 text-gray-400 transition-all group ${isPosting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-startup-blue'}`}>
                                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                        <ImageIcon size={22} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest">Showcase</span>
                                    {!isPosting && <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />}
                                </label>
                                <button 
                                    type="submit"
                                    disabled={!newPost.trim() || isPosting}
                                    className="bg-startup-blue text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 min-w-[160px] justify-center"
                                >
                                    {isPosting ? <Loader2 size={18} className="animate-spin" /> : "Publish"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Posts List */}
                <div className="space-y-12">
                    {posts.length > 0 ? posts.map((post) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            key={post._id} 
                            className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group"
                        >
                            <div className="p-10 flex items-center justify-between">
                                <div className="flex items-center gap-5 cursor-pointer" onClick={() => navigate(`/profile/${post.startup?._id}`)}>
                                    <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-startup-blue shadow-inner flex items-center justify-center text-white font-black text-2xl border-4 border-gray-50">
                                        {post.startup?.logo_url ? (
                                            <img src={post.startup.logo_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="uppercase">{post.startup?.name?.charAt(0) || 'S'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 tracking-tight text-xl group-hover:text-startup-blue transition-colors leading-none">{post.startup?.name || 'Anonymous Startup'}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Globe size={14} className="text-startup-blue/50" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{post.startup?.website_url || 'no-website.com'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-2xl">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}</span>
                                </div>
                            </div>

                            <div className="px-10 pb-10 space-y-8">
                                <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100/50">
                                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                        {post.content}
                                    </p>
                                </div>
                                {post.image && (
                                    <div className="rounded-[40px] overflow-hidden border border-gray-50 shadow-inner">
                                        <img src={post.image} alt="Update" className="w-full h-auto max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                                    </div>
                                )}
                            </div>

                            <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Network Milestone</span>
                                </div>
                                <button 
                                    onClick={() => navigate('/chat', { 
                                        state: { 
                                            targetStartup: { id: post.startup?._id, name: post.startup?.name },
                                            myId: status?.profileId 
                                        } 
                                    })}
                                    className="flex items-center gap-3 bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-startup-blue hover:text-white hover:border-startup-blue transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10 active:scale-95"
                                >
                                    <MessageSquare size={16} />
                                    Connect
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="p-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100">
                            <p className="font-bold text-gray-400 uppercase tracking-widest">No updates found in your network.</p>
                        </div>
                    )}
                </div>
            </div>
        </div> 
    );
}