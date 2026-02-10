import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Globe, MapPin, MessageSquare, Share2, Edit3, 
    X, Upload, Save, ExternalLink, Rocket, Activity, Timer, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const myProfileId = localStorage.getItem('myStartupId');
    const isOwnProfile = id === myProfileId;

    const [data, setData] = useState(null);
    const [myStatus, setMyStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit & Feedback States
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Success message state
    const [editForm, setEditForm] = useState({});
    const [tempLogo, setTempLogo] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const profileRes = await api.get(`/profiles/${id}`);
                setData(profileRes.data);
                
                const p = profileRes.data.profile;
                setEditForm({
                    ...p,
                    city: p.location?.city || '',
                    country: p.location?.country || ''
                });

                try {
                    const statusRes = await api.get('/auth/status');
                    setMyStatus(statusRes.data);
                } catch (authErr) {
                    setMyStatus(null);
                }

                setError(null);
            } catch (err) {
                console.error("Profile Error:", err);
                setError("Profile not found");
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [id]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTempLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true); 
        try {
            const payload = {
                name: editForm.name,
                tagline: editForm.tagline,
                website_url: editForm.website_url,
                detailed_description: editForm.detailed_description,
                location: {
                    city: editForm.city,
                    country: editForm.country
                },
                logo: tempLogo 
            };

            const res = await api.put('/profiles/update', payload);
            
            if (res.data.success) {
                setIsEditing(false);
                setData(prev => ({ ...prev, profile: res.data.profile }));
                const updatedP = res.data.profile;
                setEditForm({ 
                    ...updatedP, 
                    city: updatedP.location?.city || '',
                    country: updatedP.location?.country || ''
                });
                setTempLogo(null);
                
                // Trigger success message
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2500);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Update failed.");
        } finally {
            setIsSaving(false); 
        }
    };

    if (loading) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-1 bg-startup-blue/20 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }} 
                        animate={{ x: "100%" }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-full bg-startup-blue"
                    />
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">Syncing</p>
            </div>
        </motion.div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-12 bg-white rounded-[40px] shadow-xl border border-red-50">
                <p className="text-red-500 font-black text-xl mb-4">{error}</p>
                <button onClick={() => navigate('/feed')} className="text-xs font-black uppercase tracking-widest bg-gray-100 px-8 py-4 rounded-2xl">Back Home</button>
            </div>
        </div>
    );

    const { profile, role, posts } = data;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* SUCCESS NOTIFICATION */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 20, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-20 left-0 right-0 z-[150] flex justify-center pointer-events-none"
                    >
                        <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
                            <CheckCircle2 size={18} className="text-green-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Identity Updated</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto pt-32 px-4 pb-20">
                
                {/* Header Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[48px] shadow-sm border border-white p-8 md:p-10 mb-10 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        <img src={profile.logo_url} className="w-40 h-40 rounded-[40px] object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-[1.02]" alt="Logo" />

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{profile.name}</h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                                        <span className="bg-startup-blue text-white font-black uppercase tracking-[0.15em] text-[10px] px-5 py-2 rounded-full">{role}</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied!"); }} className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 shadow-sm"><Share2 size={20} /></button>
                                    {isOwnProfile ? (
                                        <button onClick={() => setIsEditing(true)} className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-startup-blue hover:shadow-lg transition-all"><Edit3 size={18} /></button>
                                    ) : (
                                        <button onClick={() => navigate('/chat', { state: { targetStartup: { id: profile._id, name: profile.name }, myId: myStatus?.profileId } })} className="bg-startup-blue text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-all"><MessageSquare size={18} /> Connect</button>
                                    )}
                                </div>
                            </div>
                            
                            <p className="mt-8 text-xl text-gray-500 font-medium leading-relaxed max-w-2xl italic">"{profile.tagline || profile.description || "Building the future."}"</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-10 pt-8 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest"><MapPin size={16} className="text-startup-blue/50" /> {profile.location?.city || 'Remote'}, {profile.location?.country || 'Global'}</div>
                                {profile.website_url && (
                                    <a href={`https://${profile.website_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-startup-blue transition-colors"><Globe size={16} className="text-startup-blue/50" /> {profile.website_url}</a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Runway Section */}
                {isOwnProfile && role === 'startup' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0"><Activity className="text-startup-blue" size={28} /></div>
                            <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Role</p><p className="font-black text-gray-900 text-lg capitalize">{role}</p></div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${myStatus?.deactivation?.daysUntilDeactivation <= 7 ? 'bg-red-50' : 'bg-green-50'}`}><Timer className={myStatus?.deactivation?.daysUntilDeactivation <= 7 ? 'text-red-500' : 'text-green-500'} size={28} /></div>
                            <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Ecosystem Runway</p><div className="flex items-baseline gap-2"><p className={`text-4xl font-black tracking-tighter ${myStatus?.deactivation?.daysUntilDeactivation <= 7 ? 'text-red-600' : 'text-green-600'}`}>{myStatus?.deactivation?.daysUntilDeactivation || 0}</p><p className="text-xs font-bold text-gray-400 uppercase">Days Left</p></div></div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-white">
                                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Identity Settings</h2>
                                    <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-white rounded-2xl text-gray-400 transition-all"><X size={20}/></button>
                                </div>
                                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                                    <div className="flex items-center gap-8 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/50">
                                        <div className="relative group">
                                            <img src={tempLogo || editForm.logo_url} className="w-24 h-24 rounded-[28px] object-cover border-4 border-white shadow-lg" />
                                            <label className="absolute -bottom-2 -right-2 cursor-pointer bg-startup-blue text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform">
                                                <Upload size={18} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} disabled={isSaving} />
                                            </label>
                                        </div>
                                        <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-gray-800">Brand Mark</p><p className="text-[11px] text-gray-400 mt-1 font-bold">Square PNG/JPG recommended</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Brand Name</label>
                                            <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} disabled={isSaving} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-startup-blue/20 transition-all font-medium text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Website URL</label>
                                            <input value={editForm.website_url || ''} onChange={e => setEditForm({...editForm, website_url: e.target.value})} disabled={isSaving} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-startup-blue/20 transition-all font-medium text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">City</label>
                                            <input value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} disabled={isSaving} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-startup-blue/20 transition-all font-medium text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Country</label>
                                            <input value={editForm.country || ''} onChange={e => setEditForm({...editForm, country: e.target.value})} disabled={isSaving} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-startup-blue/20 transition-all font-medium text-lg" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tagline</label>
                                            <textarea value={editForm.tagline || ''} onChange={e => setEditForm({...editForm, tagline: e.target.value})} disabled={isSaving} className="w-full p-5 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-startup-blue/20 transition-all font-medium h-28 resize-none text-lg" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 bg-gray-50/50 flex gap-4">
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-startup-blue text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70">
                                        {isSaving ? <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>Saving Changes...</motion.span> : <><Save size={20} /> Update Profile</>}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timeline Body */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 ml-4">
                        <div className="h-px bg-gray-200 flex-1" />
                        <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-gray-400">Ecosystem Timeline</h3>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    
                    {posts && posts.length > 0 ? posts.map(post => (
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={post._id} className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group text-left">
                            <div className="flex justify-between items-center mb-6">
                                <span className="bg-gray-50 text-gray-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">Milestone Log</span>
                                <span className="text-[11px] text-gray-300 font-bold">{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed font-medium text-xl italic mb-8">"{post.content}"</p>
                            {post.image && (
                                <div className="rounded-[32px] overflow-hidden border border-gray-50 shadow-inner">
                                    <img src={post.image} className="w-full h-auto max-h-[500px] object-cover" alt="Update" />
                                </div>
                            )}
                        </motion.div>
                    )) : (
                        <div className="bg-white p-20 rounded-[48px] border-2 border-dashed border-gray-100 text-center">
                            <Rocket className="mx-auto text-gray-200 mb-6" size={40} />
                            <p className="text-gray-300 font-black italic uppercase tracking-widest text-xs">Innovation in progress. Stay tuned.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}