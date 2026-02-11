import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, Rocket, Search, User } from 'lucide-react';
import api from '../api/axios';

export default function Navbar({ unreadCount, setUnreadCount }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    // This is now storing the 'slug' (e.g., 'acme-inc') from localStorage
    const myProfileSlug = localStorage.getItem('myStartupId');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val) => {
        setQuery(val);
        if (val.trim().length > 1) {
            setIsSearching(true);
            try {
                // Ensure the backend search controller returns 'slug'
                const res = await api.get(`/profiles/search?query=${encodeURIComponent(val)}`);
                setResults(res.data.results || []);
            } catch (err) {
                console.error("Search error", err);
            }
        } else {
            setResults([]);
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const trimmedQuery = query.trim();
            if (trimmedQuery.length > 0) {
                setIsSearching(false);
                setResults([]); 
                navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100 z-[100] px-6 py-3">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-8">
                
                {/* LOGO */}
                <Link to="/feed" className="flex items-center gap-2.5 text-startup-blue group">
                    <div className="bg-startup-blue p-1.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Rocket fill="white" className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-gray-900">Naralink</span>
                </Link>

                {/* SEARCH BAR */}
                <div className="flex-1 max-w-lg relative" ref={searchRef}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-startup-blue transition-colors" size={18} />
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown} 
                            onFocus={() => query.length > 1 && setIsSearching(true)}
                            placeholder="Search innovators, startups..."
                            className="w-full bg-gray-100/50 border border-transparent focus:border-startup-blue/20 focus:bg-white pl-12 pr-4 py-2.5 rounded-2xl outline-none text-sm font-medium transition-all"
                        />
                    </div>

                    {/* SEARCH RESULTS DROPDOWN */}
                    {isSearching && results.length > 0 && (
                        <div className="absolute top-14 w-full bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden z-[110]">
                            <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Quick Results</span>
                                <span className="text-[9px] font-bold text-startup-blue mr-2">Press Enter for all</span>
                            </div>
                            {results.map((item) => (
                                <div 
                                    key={item.slug || item._id} // Use slug as key if available
                                    onClick={() => {
                                        // CRITICAL: Navigate to /profile/slug instead of ID
                                        navigate(`/profile/${item.slug}`);
                                        setIsSearching(false);
                                        setQuery('');
                                    }}
                                    className="p-4 hover:bg-blue-50/50 cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <img 
                                        src={item.logo_url || 'https://via.placeholder.com/40'} 
                                        className="w-10 h-10 rounded-xl object-cover shadow-sm" 
                                        alt={item.name} 
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-[9px] font-black text-startup-blue uppercase">{item.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                    <Link to="/chat" className="relative p-2.5 rounded-xl text-gray-400 hover:text-startup-blue hover:bg-blue-50 transition-all">
                        <MessageSquare size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* USER PROFILE - Now using the Slug */}
                    <Link 
                        to={`/profile/${myProfileSlug}`} 
                        className="p-2.5 rounded-xl text-gray-400 hover:text-startup-blue hover:bg-blue-50 transition-all"
                    >
                        <User size={22} />
                    </Link>

                    <button 
                        onClick={handleLogout} 
                        className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>
        </nav>
    );
}