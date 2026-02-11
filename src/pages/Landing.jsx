import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Rocket, Building2, Users, Globe, ArrowRight, 
    ShieldCheck, Zap, Target, Sparkles, ChevronRight 
} from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    const FeatureCard = ({ icon: Icon, title, points, color }) => (
        <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
        >
            <div className={`p-4 rounded-2xl w-fit mb-6 ${color}`}>
                <Icon size={28} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">{title}</h3>
            <ul className="space-y-3">
                {points.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" /> {p}
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-startup-blue selection:text-white">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-startup-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="text-white fill-white" size={20} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">NaraLinks</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-2.5 font-black uppercase text-[10px] tracking-widest text-gray-500 hover:text-startup-blue transition-colors">Login</Link>
                        <Link to="/register" className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-startup-blue shadow-xl transition-all">Join Network</Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-48 pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-startup-blue rounded-full mb-8 border border-blue-100"
                    >
                        <Globe size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Innovation Stage</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] uppercase mb-8"
                    >
                        Connecting <br />
                        <span className="text-startup-blue italic">Startups & Capital</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        NaraLinks is a global networking platform where startups collaborate, connect with incubators, meet visionary founders, and attract venture capital — across India and the world.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <button onClick={() => navigate('/register')} className="px-10 py-5 bg-startup-blue text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                            Join the Network <ArrowRight size={18} />
                        </button>
                        <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-gray-900 border border-gray-100 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-gray-50 transition-all">
                            Explore Ecosystem
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* --- WHY NARALINKS --- */}
            <section className="py-24 px-6 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-startup-blue mb-6 italic">Why NaraLinks?</h2>
                        <h3 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-8">Innovation doesn’t grow in isolation.</h3>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-startup-blue pl-8">
                            "At NaraLinks, we believe the next breakthrough happens when ambitious founders, thriving startups, and forward-thinking investors come together—across borders and industries."
                        </p>
                    </div>
                    <div className="bg-gray-50 p-12 rounded-[60px] border border-gray-100 relative">
                        <p className="text-2xl font-bold text-gray-800 tracking-tight leading-snug">Whether you're building in India or scaling globally, we help you find the right people to grow faster.</p>
                        <Sparkles className="absolute -top-6 -right-6 text-startup-blue w-16 h-16 animate-spin-slow" />
                    </div>
                </div>
            </section>

            {/* --- WHAT YOU CAN DO --- */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Ecosystem Tracks</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Rocket} 
                            title="Startups" 
                            color="bg-blue-50 text-startup-blue"
                            points={["Showcase Products", "Worldwide Connectivity", "Accelerator Access", "Investor Pitching"]} 
                        />
                        <FeatureCard 
                            icon={Building2} 
                            title="Incubators" 
                            color="bg-purple-50 text-purple-600"
                            points={["Program Promotion", "Founder Discovery", "Startup Engagement", "Cohort Management"]} 
                        />
                        <FeatureCard 
                            icon={Users} 
                            title="Investors" 
                            color="bg-emerald-50 text-emerald-600"
                            points={["Network with Ventures", "Track Hubs", "Build Regional Partnerships", "Deal Flow Sync"]} 
                        />
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-32 px-6 bg-gray-900 text-white rounded-[80px] mx-4 mb-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black uppercase tracking-tighter italic">How it works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            { num: "01", title: "Identity", desc: "Create your profile—tell your story to the world." },
                            { num: "02", title: "Discover", desc: "Browse startups, programs, and partners worldwide." },
                            { num: "03", title: "Connect", desc: "Message, partner, invest, and scale fast." }
                        ].map((step, i) => (
                            <div key={i} className="relative group">
                                <span className="text-8xl font-black text-white/5 absolute -top-10 -left-6 group-hover:text-startup-blue/20 transition-colors">{step.num}</span>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{step.title}</h4>
                                <p className="text-gray-400 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MISSION SECTION --- */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <Target className="mx-auto text-startup-blue mb-8 w-16 h-16" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">Our Mission</h2>
                    <p className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                        "To democratize access to opportunity and create a borderless startup community where innovation thrives."
                    </p>
                </div>
            </section>

            {/* --- CLOSING CTA --- */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto bg-startup-blue rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-500/40">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-none">Join the Global Startup <br />Network Today</h2>
                        <div className="flex flex-wrap justify-center gap-6 mt-12">
                            <Link to="/register" className="px-10 py-5 bg-white text-startup-blue rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl">Create Your Identity</Link>
                            <Link to="/register" className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl">Partner With Innovators</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 px-6 border-t border-gray-200 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 NaraLinks Protocol. All Rights Reserved.</p>
            </footer>
        </div>
    );
}