import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Globe, MapPin, MessageSquare, Edit3, X, Upload, Save, 
    Rocket, Activity, CheckCircle2, Briefcase, Target, DollarSign, 
    Users, Building2, Shield, Zap, HelpCircle, Clock, Lock, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { id: slug } = useParams(); 
    const navigate = useNavigate();
    
    // Auth & Identity Checks
    const token = localStorage.getItem('token'); 
    const myProfileSlug = localStorage.getItem('myStartupId');
    
    const isOwnProfile = slug && myProfileSlug && String(slug) === String(myProfileSlug);

    const [data, setData] = useState(null);
    const [myStatus, setMyStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [tempLogo, setTempLogo] = useState(null);

    useEffect(() => { 
        if (slug && slug !== 'undefined') {
            fetchProfileData(); 
        }
    }, [slug]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const profileRes = await api.get(`/profiles/${slug}`);
            setData(profileRes.data);
            const p = profileRes.data.profile;
            
            setEditForm({
                ...p,
                city: p.location?.city || '',
                state: p.location?.state || '',
                country: p.location?.country || '',
                primary_industry: p.industry?.primary || '',
                target_market: p.industry?.target_market || 'B2B', 
                product_stage: p.product?.stage || 'concept',
                funding_stage: p.funding?.stage || 'bootstrapped',
                contact_phone: p.contact_phone || '', 
                contact_email: p.contact_email || '', 
                organization_type: p.organization_type || 'incubator',
                website_url: p.website_url || '',
                linkedin_url: p.socials?.linkedin_url || '',
                detailed_description: p.detailed_description || p.description || ''
            });

            if (token) {
                try {
                    const statusRes = await api.get('/auth/status');
                    setMyStatus(statusRes.data);
                } catch (authErr) { setMyStatus(null); }
            }
            setError(null);
        } catch (err) { 
            console.error("Profile Fetch Error:", err);
            setError("Profile not found"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleConnect = () => {
        if (!token) {
            navigate('/login');
            return;
        }
        navigate('/chat', { state: { targetStartup: { id: slug, name: data.profile.name } } });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await api.put('/profiles/update', { ...editForm, logo: tempLogo });
            if (res.data.success) {
                setData(prev => ({ ...prev, profile: res.data.profile }));
                setIsEditing(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2500);
            }
        } catch (err) { 
            alert(err.response?.data?.error || "Update failed."); 
        } finally { 
            setIsSaving(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-gray-400 animate-pulse uppercase tracking-[0.3em]">Syncing Identity...</div>;
    
    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4 font-sans">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">404</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Identity Not Found</p>
            <button onClick={() => navigate('/feed')} className="text-startup-blue font-black underline uppercase text-xs tracking-widest">Return to Feed</button>
        </div>
    );

    const { profile, role, posts } = data;

    const DataChip = ({ icon: Icon, label, value }) => (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 bg-blue-50 text-startup-blue rounded-2xl w-fit mb-4"><Icon size={20} /></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
            <p className="font-bold text-gray-900 mt-1">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-[#fafafa]" style={{ backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
            
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-10 left-0 right-0 z-[200] flex justify-center">
                        <div className="bg-gray-900 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl font-black text-xs uppercase tracking-widest border border-white/10">
                            <CheckCircle2 size={18} className="text-green-400" /> Identity Updated
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* --- HEADER CARD --- */}
                <div className="bg-white rounded-[48px] border border-gray-100 p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden">
                    <img src={profile.logo_url} className="w-44 h-44 rounded-[40px] object-cover border-4 border-white shadow-2xl z-10" alt="logo" />
                    
                    <div className="flex-1 text-center md:text-left z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">{profile.name}</h1>
                                <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                    <span className="bg-startup-blue text-white text-[10px] font-black uppercase px-5 py-2 rounded-full shadow-lg shadow-blue-500/20">{role}</span>
                                    <span className="bg-gray-900 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full tracking-widest">{profile.status || profile.organization_type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {!isOwnProfile ? (
                                    <button 
                                        onClick={handleConnect}
                                        className="flex-1 md:flex-none bg-startup-blue text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        {token ? <><MessageSquare size={18} className="group-hover:rotate-12 transition-transform" /> Connect</> : <><Lock size={18}/> Login to Connect</>}
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-5 bg-gray-900 text-white rounded-2xl hover:bg-startup-blue transition-all shadow-xl flex items-center gap-2 group">
                                        <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2">Edit Profile</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {isOwnProfile && role === 'startup' && (
                            <div className="mt-8 flex items-center gap-6 p-6 bg-gray-50 rounded-[32px] border border-gray-100 max-w-sm mx-auto md:mx-0">
                                <div className={`p-4 rounded-2xl ${myStatus?.daysUntilDeactivation <= 7 ? 'bg-red-500 text-white animate-pulse' : 'bg-startup-blue text-white'}`}>
                                    <Activity size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Account Runway</p>
                                    <h4 className="text-xl font-black text-gray-900 leading-none mt-1">{myStatus?.daysUntilDeactivation || 30} Days Left</h4>
                                </div>
                            </div>
                        )}
                        <p className="mt-8 text-2xl text-gray-500 font-medium max-w-3xl italic leading-relaxed">"{profile.tagline || profile.description || "Innovating at the speed of thought."}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Core Intelligence */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 ml-4">Core Intelligence</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {role === 'startup' ? (
                                    <>
                                        <DataChip icon={Briefcase} label="Industry" value={profile.industry?.primary} />
                                        <DataChip icon={Target} label="Market" value={profile.industry?.target_market} />
                                        <DataChip icon={Zap} label="Stage" value={profile.product?.stage} />
                                        <DataChip icon={DollarSign} label="Funding" value={profile.funding?.stage} />
                                    </>
                                ) : (
                                    <>
                                        <DataChip icon={Building2} label="Program" value={profile.programDetails?.program_name} />
                                        <DataChip icon={Shield} label="Equity" value={`${profile.programDetails?.equity_taken_percentage}%`} />
                                        <DataChip icon={Users} label="Portfolio" value={`${profile.trackRecord?.number_of_startups_supported} Active`} />
                                        <DataChip icon={HelpCircle} label="Format" value={profile.programDetails?.program_format} />
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Mission Details</h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{profile.detailed_description || profile.description || "No bio available."}</p>
                        </section>

                        {/* --- MILESTONES WITH LOCK LOGIC --- */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 px-4">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Milestones & Updates</h3>
                                <div className="h-px bg-gray-100 flex-1" />
                            </div>

                            <div className="relative">
                                {!token && posts && posts.length > 0 && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center p-8 bg-white/10 backdrop-blur-[2px]">
                                        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center max-w-sm">
                                            <Lock className="text-startup-blue mx-auto mb-4" size={32} />
                                            <h4 className="font-black text-gray-900 uppercase tracking-tighter">Timeline Locked</h4>
                                            <p className="text-gray-500 text-xs font-bold mt-2 leading-relaxed">Milestone data is available to authenticated network members only.</p>
                                            <button onClick={() => navigate('/login')} className="mt-6 w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Sign In to Access</button>
                                        </div>
                                    </div>
                                )}

                                <div className={`grid gap-6 ${!token ? "blur-xl select-none pointer-events-none opacity-40" : ""}`}>
                                    {posts && posts.length > 0 ? posts.map((post) => (
                                        <motion.div key={post._id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-startup-blue uppercase tracking-widest mb-4"><Clock size={14} /> {new Date(post.createdAt).toLocaleDateString()}</div>
                                            <p className="text-gray-700 text-xl font-medium mb-6">"{post.content}"</p>
                                            {post.image && <img src={post.image} className="rounded-[32px] w-full object-cover max-h-[500px]" alt="Milestone" />}
                                        </motion.div>
                                    )) : (
                                        <div className="bg-white p-20 rounded-[48px] border-2 border-dashed border-gray-100 text-center">
                                            <Rocket className="mx-auto text-gray-200 mb-6 animate-bounce" size={40} />
                                            <p className="text-gray-300 font-black italic uppercase tracking-widest text-[10px]">Awaiting First Milestone.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* --- SIDEBAR CONNECTIVITY CARD --- */}
                    <aside className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Connectivity</h3>
                            
                            {/* BLUR OVERLAY FOR CARD IF NOT LOGGED IN */}
                            {!token && (
                                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                    <Lock size={20} className="text-startup-blue mb-2" />
                                    <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Auth Required</p>
                                    <button onClick={() => navigate('/login')} className="mt-4 text-[10px] text-startup-blue font-bold underline uppercase">Login to View Details</button>
                                </div>
                            )}

                            <div className={`space-y-4 ${!token ? "blur-md select-none pointer-events-none" : ""}`}>
                                {profile.website_url && <a href={`https://${profile.website_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-startup-blue hover:text-white transition-all font-bold text-sm"><Globe size={18}/> Website</a>}
                                {profile.socials?.linkedin_url && <a href={profile.socials.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-startup-blue hover:text-white transition-all font-bold text-sm"><Users size={18}/> LinkedIn</a>}
                                
                                <div className="pt-6 border-t border-gray-50 space-y-4">
                                    {/* Email Display */}
                                    <div className="flex items-center gap-3 text-gray-600 text-xs font-bold">
                                        <Mail size={16} className="text-gray-400"/> 
                                        <span>{profile.contact_email || 'No email provided'}</span>
                                    </div>
                                    
                                    {/* Phone Display */}
                                    <div className="flex items-center gap-3 text-gray-600 text-xs font-bold">
                                        <Phone size={16} className="text-gray-400"/> 
                                        <span>{profile.contact_phone || 'No phone provided'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-gray-600 text-xs font-bold">
                                        <MapPin size={16} className="text-gray-400"/> 
                                        <span>{profile.location?.city || 'Remote'}, {profile.location?.country || 'Network'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* --- EDIT MODAL --- */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
                            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Edit Identity</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X /></button>
                            </div>
                            
                            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
                                {/* CATEGORY 1: CORE IDENTITY */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase text-startup-blue tracking-widest border-b pb-2">Core Identity</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <img src={tempLogo || editForm.logo_url} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt="preview" />
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase text-gray-400">Update Entity Mark</p>
                                                <input type="file" onChange={(e) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => setTempLogo(reader.result);
                                                    reader.readAsDataURL(e.target.files[0]);
                                                }} className="text-xs font-bold cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Official Name</label>
                                            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-startup-blue/20 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">One-Line Tagline</label>
                                            <input value={editForm.tagline} onChange={e => setEditForm({...editForm, tagline: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-startup-blue/20 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* CATEGORY 2: INTELLIGENCE & SPECS */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase text-startup-blue tracking-widest border-b pb-2">Professional Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {role === 'startup' ? (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Target Market</label>
                                                    <select value={editForm.target_market} onChange={e => setEditForm({...editForm, target_market: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold">
                                                        <option value="B2B">B2B</option><option value="B2C">B2C</option><option value="B2G">B2G</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Industry</label>
                                                    <input value={editForm.primary_industry} onChange={e => setEditForm({...editForm, primary_industry: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Product Stage</label>
                                                    <input value={editForm.product_stage} onChange={e => setEditForm({...editForm, product_stage: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Org Type</label>
                                                    <input value={editForm.organization_type} onChange={e => setEditForm({...editForm, organization_type: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Equity Taken %</label>
                                                    <input type="number" value={editForm.equity_taken_percentage} onChange={e => setEditForm({...editForm, equity_taken_percentage: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* CATEGORY 3: CONNECTIVITY & LOCATION */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase text-startup-blue tracking-widest border-b pb-2">Connectivity & Location</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">City</label><input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Country</label><input value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Public Email</label><input value={editForm.contact_email} onChange={e => setEditForm({...editForm, contact_email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Public Phone</label><input value={editForm.contact_phone} onChange={e => setEditForm({...editForm, contact_phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Website URL</label><input value={editForm.website_url} onChange={e => setEditForm({...editForm, website_url: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">LinkedIn URL</label><input value={editForm.linkedin_url} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" /></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Detailed Identity Bio</label>
                                    <textarea value={editForm.detailed_description} onChange={e => setEditForm({...editForm, detailed_description: e.target.value})} className="w-full p-6 bg-gray-50 rounded-3xl outline-none h-40 resize-none font-medium focus:bg-white focus:ring-2 focus:ring-startup-blue/20 transition-all" />
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50">
                                <button onClick={handleSave} disabled={isSaving} className="w-full bg-startup-blue text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
                                    {isSaving ? <Activity size={18} className="animate-spin" /> : <><Save size={18}/> Finalize Updates</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}