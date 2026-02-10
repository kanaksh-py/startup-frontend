import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    Rocket, 
    Building2, 
    Upload, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle, 
    PlusCircle,
    Globe,
    MapPin,
    Briefcase
} from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('startup');
    
    const [formData, setFormData] = useState({
        // Auth & Basic
        email: '', password: '', name: '', website_url: '', logo: '',
        // Location
        city: '', state: '', country: '',
        // Startup Specific
        tagline: '', detailed_description: '', status: 'idea', primary_industry: '',
        funding_stage: 'bootstrapped', seeking_incubation: false,
        // Incubator Specific
        organization_type: 'incubator', mentorship_offered: false, office_space: false,
        startups_funded: 0 // Changed from funding_offered to a numeric field
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
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('myStartupId', res.data.user.profileId);
            localStorage.setItem('userRole', res.data.user.role);
            
            window.location.href = '/feed';
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Visual Progress Header */}
                <div className="bg-gray-100 h-1.5 flex">
                    <div className={`bg-startup-blue transition-all duration-700 h-full ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
                </div>

                <div className="p-8 md:p-12">
                    
                    {/* STEP 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="text-center">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Identify Yourself</h1>
                                <p className="text-gray-500 mt-2 font-medium">Select your role in the ecosystem to continue</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button 
                                    type="button"
                                    onClick={() => { setRole('startup'); setStep(2); }}
                                    className={`p-8 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${role === 'startup' ? 'border-startup-blue bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}
                                >
                                    <Rocket className={`w-12 h-12 mb-4 ${role === 'startup' ? 'text-startup-blue' : 'text-gray-300'}`} />
                                    <h3 className="font-black text-xl text-gray-800">I am a Startup</h3>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">I am building a product/service and looking to scale, find funding, or incubation.</p>
                                    {role === 'startup' && <CheckCircle className="absolute top-4 right-4 text-startup-blue" size={20} />}
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => { setRole('incubator'); setStep(2); }}
                                    className={`p-8 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${role === 'incubator' ? 'border-startup-blue bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}
                                >
                                    <Building2 className={`w-12 h-12 mb-4 ${role === 'incubator' ? 'text-startup-blue' : 'text-gray-300'}`} />
                                    <h3 className="font-black text-xl text-gray-800">I am an Incubator</h3>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">I provide mentorship, resources, and programs to help startups succeed.</p>
                                    {role === 'incubator' && <CheckCircle className="absolute top-4 right-4 text-startup-blue" size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Credentials & Brand */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft /></button>
                                <h2 className="text-2xl font-black text-gray-900">Core Identity</h2>
                            </div>
                            
                            <div className="flex flex-col items-center py-4">
                                <label className="relative cursor-pointer group">
                                    <div className="w-28 h-28 bg-gray-50 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 group-hover:border-startup-blue transition-colors">
                                        {formData.logo ? (
                                            <img src={formData.logo} className="w-full h-full object-cover" alt="Logo" />
                                        ) : (
                                            <Upload className="text-gray-300" size={32} />
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    <div className="absolute -bottom-2 -right-2 bg-startup-blue text-white p-2 rounded-xl shadow-lg border-4 border-white">
                                        <PlusCircle size={16} />
                                    </div>
                                </label>
                                <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">Brand Mark / Logo</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Entity Name</label>
                                    <input type="text" placeholder="e.g. Acme Corp" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Work Email</label>
                                    <input type="email" placeholder="hello@company.com" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Secure Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Website URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                        <input type="text" placeholder="www.example.com" className="w-full p-3.5 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-startup-blue/20 outline-none" onChange={e => setFormData({...formData, website_url: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={() => setStep(3)} className="w-full bg-startup-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all">
                                Next: {role === 'startup' ? 'Product Info' : 'Program Info'} <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Specialized Data */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <button type="button" onClick={() => setStep(2)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft /></button>
                                <h2 className="text-2xl font-black text-gray-900">{role === 'startup' ? 'Startup Intelligence' : 'Incubator Program'}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {role === 'startup' ? (
                                    <>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tagline</label>
                                            <input type="text" placeholder="Your startup in one sentence" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20" onChange={e => setFormData({...formData, tagline: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Current Status</label>
                                            <select className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none" onChange={e => setFormData({...formData, status: e.target.value})}>
                                                <option value="idea">Idea Stage</option>
                                                <option value="MVP">MVP Live</option>
                                                <option value="early-stage">Early Traction</option>
                                                <option value="scaling">Scaling</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Industry</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                                <input type="text" placeholder="e.g. FinTech" className="w-full p-3.5 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20" onChange={e => setFormData({...formData, primary_industry: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                            <input type="checkbox" className="w-5 h-5 accent-startup-blue" onChange={e => setFormData({...formData, seeking_incubation: e.target.checked})} />
                                            <label className="text-xs font-bold text-blue-800">We are currently looking for Incubation / Acceleration programs</label>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Organization Type</label>
                                            <select className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none" onChange={e => setFormData({...formData, organization_type: e.target.value})}>
                                                <option value="incubator">Incubator</option>
                                                <option value="accelerator">Accelerator</option>
                                                <option value="VC-backed">VC-Backed Studio</option>
                                                <option value="government">Government Program</option>
                                            </select>
                                        </div>
                                        {/* REPLACED FUNDING OFFERED WITH STARTUPS FUNDED */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Startups Funded</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => { if (e.key === '-' || e.key === '.') e.preventDefault(); }}
                                                placeholder="e.g. 15" 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20" 
                                                onChange={e => setFormData({...formData, startups_funded: parseInt(e.target.value) || 0})} 
                                            />
                                        </div>
                                        <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                                <input type="checkbox" className="w-5 h-5 accent-green-600" onChange={e => setFormData({...formData, mentorship_offered: e.target.checked})} />
                                                <label className="text-[10px] font-black text-green-800 uppercase tracking-widest">Mentorship</label>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                                <input type="checkbox" className="w-5 h-5 accent-green-600" onChange={e => setFormData({...formData, office_space: e.target.checked})} />
                                                <label className="text-[10px] font-black text-green-800 uppercase tracking-widest">Office Space</label>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">HQ City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                        <input type="text" placeholder="City" className="w-full p-3.5 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20" onChange={e => setFormData({...formData, city: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Country</label>
                                    <input type="text" placeholder="Country" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-startup-blue/20" onChange={e => setFormData({...formData, country: e.target.value})} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-startup-blue transition-colors shadow-xl disabled:opacity-50"
                            >
                                {loading ? "Encrypting Profile..." : "Initialize Ecosystem Account"} <CheckCircle size={20} />
                            </button>
                        </form>
                    )}

                    {/* Shared Auth Footer */}
                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account? <Link to="/login" className="text-startup-blue font-black hover:underline underline-offset-4">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}