import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Globe, Image as ImageIcon, X, MessageSquare, 
    Rocket, Activity, Calendar, Loader2, AlertCircle, 
    Timer, CheckCircle2, Lock, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(null);
    const [newPost, setNewPost] = useState('');
    const [image, setImage] = useState(null); 
    const [preview, setPreview] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const navigate = useNavigate();

    useEffect(() => { 
        fetchData(); 
    }, []);

    const fetchData = async () => {
        try {
            // Ensure these routes exactly match your backend router setup
            const [feedRes, statusRes] = await Promise.all([
                api.get('/myfeed/feed'), // Matches router.get('/feed') + app.use('/api/myfeed')
                api.get('/auth/status')
            ]);
            
            setPosts(feedRes.data.data || []);
            setStatus(statusRes.data);
        } catch (err) { 
            console.error("Fetch Error:", err.response?.status, err.message);
            if (err.response?.status === 404) {
                console.error("ROUTE MISMATCH: Check your server.js and globalFeed.js paths.");
            }
        } finally { 
            setLoading(false); 
        }
    };

    const getCooldown = () => {
        if (!status?.lastPostDate) return { active: false, msg: "" };
        const diff = new Date() - new Date(status.lastPostDate);
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        
        if (diff < weekInMs) {
            const remaining = weekInMs - diff;
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            return { 
                active: true, 
                msg: days > 0 ? `${days}d ${hours}h left` : `${hours}h left` 
            };
        }
        return { active: false, msg: "" };
    };

    const cooldown = getCooldown();
    const isInactive = status?.status === 'inactive';

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrorModal({ show: true, message: "Image too large (Max 10MB)" });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || (cooldown.active && !isInactive)) return;

        setIsPosting(true);
        try {
            await api.post('/posts', { content: newPost, image: image });
            setNewPost('');
            setPreview('');
            setImage(null);
            await fetchData(); 
        } catch (err) {
            setErrorModal({ 
                show: true, 
                message: err.response?.data?.message || "Sync Protocol Failure." 
            });
        } finally { 
            setIsPosting(false); 
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#fafafa]">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="w-10 h-10 text-startup-blue animate-spin" />
                <p className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em]">Network Syncing...</p>
            </div>
        </div>
    );

    return (
        <div 
            className="min-h-screen pt-32 pb-20 px-4 bg-[#fafafa]"
            style={{
                backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}
        >
            <div className="max-w-2xl mx-auto space-y-8">
                <AnimatePresence>
                    {errorModal.show && (
                        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
                                <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                                <h3 className="font-black text-gray-900 uppercase">Sync Denied</h3>
                                <p className="text-gray-500 text-sm mb-6">{errorModal.message}</p>
                                <button onClick={() => setErrorModal({ show: false, message: '' })} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Acknowledge</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isInactive && (
                    <div className="p-8 bg-gray-900 text-white rounded-[40px] shadow-2xl flex flex-col items-center text-center gap-4">
                        <Lock className="text-startup-blue" size={32} />
                        <h2 className="text-xl font-black uppercase">Identity Deactivated</h2>
                        <p className="text-gray-400 text-sm">Profile hidden due to inactivity. Share a milestone to restore sync.</p>
                    </div>
                )}

                {status?.role === 'startup' && (
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm relative overflow-hidden">
                        <form onSubmit={handlePostSubmit} className={cooldown.active && !isInactive ? "blur-md pointer-events-none opacity-40" : ""}>
                            <textarea
                                className="w-full p-6 bg-gray-50 rounded-2xl outline-none resize-none h-32 text-lg font-medium transition-all"
                                placeholder="What's the latest milestone?"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            {preview && (
                                <div className="relative mt-4 rounded-2xl overflow-hidden border-4 border-gray-50">
                                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                                    <button type="button" onClick={() => { setPreview(''); setImage(null); }} className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-xl"><X size={18} /></button>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                                <label className="cursor-pointer flex items-center gap-3 p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-startup-blue transition-all">
                                    <ImageIcon size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <button disabled={isPosting || !newPost.trim()} className="bg-startup-blue text-white px-10 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">
                                    {isPosting ? <Loader2 size={16} className="animate-spin" /> : "Sync Milestone"}
                                </button>
                            </div>
                        </form>

                        {cooldown.active && !isInactive && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 flex flex-col items-center gap-3">
                                    <Timer className="text-startup-blue" size={24} />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Protocol Cooldown</p>
                                        <p className="text-lg font-black text-gray-900">Next: {cooldown.msg}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-8">
                    {posts.length > 0 ? posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${post.startup?.slug}`)}>
                                    <img src={post.startup?.logo_url} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-50" />
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg leading-none">{post.startup?.name}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/chat', { state: { targetStartup: { id: post.startup?.slug, name: post.startup?.name } } })}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-startup-blue hover:text-white"
                                >
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                            <p className="text-gray-700 text-xl font-medium italic">"{post.content}"</p>
                            {post.image && <img src={post.image} className="mt-6 rounded-[32px] w-full object-cover max-h-[500px]" />}
                        </div>
                    )) : (
                        <div className="p-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100">
                            <Rocket className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="font-black text-gray-300 uppercase tracking-widest text-[10px]">No milestones detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}