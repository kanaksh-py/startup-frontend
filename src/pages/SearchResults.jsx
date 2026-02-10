import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Globe, MapPin, Rocket, Building2, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchResults() {
    // 1. Hook to read the "?q=..." from the URL
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); // This must match the 'q' in your Navbar
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [filterType, setFilterType] = useState('all'); 
    const [selectedCity, setSelectedCity] = useState('all');

    // 2. Fetch results whenever the 'query' in the URL changes
    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // Ensure this matches your backend endpoint
                const res = await api.get(`/profiles/search?query=${encodeURIComponent(query)}`);
                setResults(res.data.results || []);
            } catch (err) {
                console.error("Search Page Error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]); // Triggered whenever the user presses Enter in Navbar

    // Generate unique city list from current results for the filter dropdown
    const cities = useMemo(() => {
        const uniqueCities = new Set(results.map(item => item.location?.city).filter(Boolean));
        return ['all', ...Array.from(uniqueCities)];
    }, [results]);

    // Filtering logic
    const filteredResults = useMemo(() => {
        return results.filter(item => {
            const matchesType = filterType === 'all' || item.role === filterType;
            const matchesCity = selectedCity === 'all' || item.location?.city === selectedCity;
            return matchesType && matchesCity;
        });
    }, [results, filterType, selectedCity]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-1 bg-startup-blue/20 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }} animate={{ x: "100%" }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-full bg-startup-blue"
                    />
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">Filtering Ecosystem</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] pt-32 px-4 pb-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* FILTER SIDEBAR */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm sticky top-28">
                        <div className="flex items-center gap-3 mb-8">
                            <Filter size={18} className="text-startup-blue" />
                            <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest">Filters</h2>
                        </div>

                        <div className="space-y-4 mb-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Type</p>
                            <div className="flex flex-col gap-2">
                                {['all', 'startup', 'incubator'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold capitalize transition-all text-left ${filterType === type ? 'bg-startup-blue text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {type}s
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">HQ Location</p>
                            <select 
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-startup-blue/20 capitalize"
                            >
                                {cities.map(city => (
                                    <option key={city} value={city}>{city === 'all' ? 'All Cities' : city}</option>
                                ))}
                            </select>
                        </div>

                        {(filterType !== 'all' || selectedCity !== 'all') && (
                            <button 
                                onClick={() => { setFilterType('all'); setSelectedCity('all'); }}
                                className="mt-8 w-full flex items-center justify-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                            >
                                <X size={14} /> Reset Filters
                            </button>
                        )}
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="lg:col-span-9 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 ml-2">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">
                                Results for <span className="text-startup-blue">"{query}"</span>
                            </h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                                Showing {filteredResults.length} matches
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredResults.length > 0 ? filteredResults.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    key={item._id}
                                    onClick={() => navigate(`/profile/${item._id}`)}
                                    className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all cursor-pointer group flex flex-col md:flex-row items-center gap-8"
                                >
                                    <img 
                                        src={item.logo_url || 'https://via.placeholder.com/100'} 
                                        className="w-24 h-24 rounded-[32px] object-cover shadow-lg border-4 border-white group-hover:scale-105 transition-transform shrink-0" 
                                        alt="Logo" 
                                    />
                                    
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{item.name}</h3>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${item.role === 'startup' ? 'bg-blue-50 text-startup-blue' : 'bg-green-50 text-green-600'}`}>
                                                {item.role === 'startup' ? <Rocket size={12} /> : <Building2 size={12} />}
                                                {item.role}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin size={14} className="text-startup-blue/40" /> {item.location?.city || 'Global HQ'}
                                            </div>
                                            {item.website_url && (
                                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                    <Globe size={14} className="text-startup-blue/40" /> {item.website_url}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-2xl text-gray-300 group-hover:bg-startup-blue group-hover:text-white transition-all shadow-inner hidden md:block">
                                        <Rocket size={20} />
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="bg-white p-20 rounded-[48px] border-2 border-dashed border-gray-100 text-center"
                                >
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="text-gray-200" size={32} />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No results match your filters.</p>
                                    <button onClick={() => {setFilterType('all'); setSelectedCity('all');}} className="mt-4 text-startup-blue font-black text-[10px] uppercase underline tracking-widest">Clear all</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}