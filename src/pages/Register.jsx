import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    Rocket, Building2, Upload, ChevronRight, ChevronLeft, 
    CheckCircle, PlusCircle, Globe, MapPin, Briefcase, 
    Users, Target, DollarSign, Link as LinkIcon, Info, ShieldCheck, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('startup');
    
    const [formData, setFormData] = useState({
        // Auth & Basic
        email: '', password: '', name: '', website_url: '', logo: '',
        tagline: '', detailed_description: '', founded_year: '', 
        legal_entity_name: '', company_registration_number: '',
        contact_phone: '', contact_email: '', // Captured for connectivity
        
        // Location
        city: '', state: '', country: '', remote_friendly: false,
        
        // Startup Specific - Market & Product
        status: 'idea', primary_industry: '', niche: '', 
        problem_statement: '', target_market: 'B2B', customer_segment: '',
        product_stage: 'concept', business_model: '', revenue_model: '', ip_status: 'none',
        
        // Startup Specific - Funding & Team
        funding_stage: 'bootstrapped', total_funding_amount: 0, key_investors: '',
        team_size: 1, hiring: false,
        
        // Looking For
        seeking_incubation: false, seeking_funding: false, 
        seeking_partners: false, seeking_mentors: false,

        // Socials
        linkedin_url: '', twitter_url: '', pitch_deck_url: '',

        // Incubator Specific
        organization_type: 'incubator', startups_funded: 0,
        program_name: '', program_format: 'hybrid', equity_taken_percentage: 0,
        mentorship_offered: false, office_space: false
    });

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, logo: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { ...formData, role });
            
            // --- SYNCED STORAGE PROTOCOL ---
            localStorage.setItem('token', res.data.token);
            
            // 1. Store the SLUG for unique URLs (Navigation)
            localStorage.setItem('myStartupId', res.data.user.profileSlug || res.data.user.profileId); 
            
            // 2. Store the MongoDB ObjectID for Chat rooms and Logic
            localStorage.setItem('myProfileId', res.data.user.profileId);
            
            localStorage.setItem('userRole', res.data.user.role);
            
            // Force hard refresh to initialize Socket connection immediately
            window.location.href = '/feed';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Registration encountered a protocol error.";
            console.error("Backend Error Details:", err.response?.data);
            alert(`Registration Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pt-24 pb-12 px-4 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100">
                
                {/* Dynamic Progress Header */}
                <div className="bg-gray-100 h-2 flex">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        className="bg-startup-blue h-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                    />
                </div>

                <div className="p-8 md:p-16">
                    
                    {/* STEP 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center">
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">Identify Path</h1>
                                <p className="text-gray-400 mt-4 font-bold uppercase text-[10px] tracking-widest">Initialization of ecosystem entry</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button 
                                    type="button"
                                    onClick={() => { setRole('startup'); setStep(2); }} 
                                    className={`p-10 rounded-[40px] border-4 transition-all text-left group relative overflow-hidden ${role === 'startup' ? 'border-startup-blue bg-blue-50/30' : 'border-gray-50 hover:border-blue-100'}`}
                                >
                                    <Rocket className={`w-14 h-14 mb-6 ${role === 'startup' ? 'text-startup-blue' : 'text-gray-300'}`} />
                                    <h3 className="font-black text-2xl text-gray-900 uppercase">Startup</h3>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">Building product and scaling ops.</p>
                                    {role === 'startup' && <CheckCircle className="absolute top-6 right-6 text-startup-blue" size={28} />}
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => { setRole('incubator'); setStep(2); }} 
                                    className={`p-10 rounded-[40px] border-4 transition-all text-left group relative overflow-hidden ${role === 'incubator' ? 'border-startup-blue bg-blue-50/30' : 'border-gray-50 hover:border-blue-100'}`}
                                >
                                    <Building2 className={`w-14 h-14 mb-6 ${role === 'incubator' ? 'text-startup-blue' : 'text-gray-300'}`} />
                                    <h3 className="font-black text-2xl text-gray-900 uppercase">Incubator</h3>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">Resources and program access.</p>
                                    {role === 'incubator' && <CheckCircle className="absolute top-6 right-6 text-startup-blue" size={28} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Core Identity */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setStep(1)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><ChevronLeft size={20}/></button>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Core Identity</h2>
                            </div>
                            
                            <div className="flex flex-col items-center py-4">
                                <label className="relative cursor-pointer group">
                                    <div className="w-32 h-32 bg-gray-50 rounded-[32px] flex items-center justify-center overflow-hidden border-4 border-dashed border-gray-200 group-hover:border-startup-blue transition-all">
                                        {formData.logo ? <img src={formData.logo} className="w-full h-full object-cover" alt="logo" /> : <Upload className="text-gray-300" size={32} />}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-startup-blue text-white p-2.5 rounded-2xl shadow-xl border-4 border-white">
                                        <PlusCircle size={18} />
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                                <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.2em]">Entity Mark / Logo</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Official Name</label>
                                    <input type="text" placeholder="e.g. Acme Corp" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20 font-bold" onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Auth Email</label>
                                    <input type="email" placeholder="hello@company.com" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20 font-bold" onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Secure Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20 font-bold" onChange={e => setFormData({...formData, password: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Website URL</label>
                                    <input type="text" placeholder="www.example.com" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20 font-bold" onChange={e => setFormData({...formData, website_url: e.target.value})} />
                                </div>
                            </div>
                            <button type="button" onClick={() => setStep(3)} className="w-full bg-startup-blue text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                                Next: Specs <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Professional Specifications */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setStep(2)} className="p-3 bg-gray-100 rounded-2xl"><ChevronLeft size={20}/></button>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Specs</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {role === 'startup' ? (
                                    <>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Tagline</label>
                                            <input placeholder="Innovating the..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setFormData({...formData, tagline: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Industry</label>
                                            <input placeholder="e.g. FinTech" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setFormData({...formData, primary_industry: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Market</label>
                                            <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setFormData({...formData, target_market: e.target.value})}>
                                                <option value="B2B">B2B (Enterprise)</option>
                                                <option value="B2C">B2C (Consumer)</option>
                                                <option value="B2G">B2G (Government)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Mission</label>
                                            <textarea placeholder="Problem Statement..." className="w-full p-6 bg-gray-50 rounded-[32px] outline-none h-32 font-bold resize-none" onChange={e => setFormData({...formData, problem_statement: e.target.value})} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Incubator Bio</label>
                                            <textarea placeholder="Program description..." className="w-full p-6 bg-gray-50 rounded-[32px] h-24 font-bold outline-none" onChange={e => setFormData({...formData, detailed_description: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Org Type</label>
                                            <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setFormData({...formData, organization_type: e.target.value})}>
                                                <option value="incubator">Incubator</option>
                                                <option value="accelerator">Accelerator</option>
                                                <option value="VC-backed">VC-Backed Studio</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Equity Taken %</label>
                                            <input type="number" placeholder="0" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" onChange={e => setFormData({...formData, equity_taken_percentage: e.target.value})} />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setStep(4)} className="w-full bg-startup-blue text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-2">
                                Next: Connectivity <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Network & Finalization */}
                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setStep(3)} className="p-3 bg-gray-100 rounded-2xl"><ChevronLeft size={20}/></button>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Connectivity</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">City</label>
                                    <input placeholder="e.g. New York" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, city: e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Country</label>
                                    <input placeholder="USA" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, country: e.target.value})} required />
                                </div>

                                {/* CONTACT FIELDS INTEGRATED */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Public Contact Email</label>
                                    <input type="email" placeholder="contact@company.com" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, contact_email: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Public Phone</label>
                                    <input type="text" placeholder="+1..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                                </div>
                                
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">LinkedIn URL</label>
                                    <input placeholder="linkedin.com/company/..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, linkedin_url: e.target.value})} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-black text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-startup-blue transition-all disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>Initialize Identity <ShieldCheck className="group-hover:scale-125 transition-transform" size={20} /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            Existing Identity? <Link to="/login" className="text-startup-blue hover:underline underline-offset-4 transition-all ml-1">Authenticate</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}