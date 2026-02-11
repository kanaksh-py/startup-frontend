import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Send, ChevronLeft, MessageSquare, User, Loader2 } from 'lucide-react';

export default function Chat({ globalSocket, setUnreadCount }) {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef();

    // targetStartup.id is the SLUG from navigation state
    const targetStartup = location.state?.targetStartup; 
    const myId = localStorage.getItem('myProfileId'); // Must be MongoDB _id

    const [messages, setMessages] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [text, setText] = useState('');
    const [realConversationId, setRealConversationId] = useState(null);
    const [isResolvingId, setIsResolvingId] = useState(false);

    // 1. Resolve Target Slug to ObjectID and join room
    // This MUST run every time targetStartup.id changes
    useEffect(() => {
        const resolveTargetId = async () => {
            if (!targetStartup?.id || !myId) return;
            
            setIsResolvingId(true);
            try {
                // Get actual MongoDB _id from the slug
                const res = await api.get(`/profiles/${targetStartup.id}`);
                const targetObjectId = res.data.profile._id;
                
                // Deterministic Room ID (Sorted ObjectIDs)
                const room = [myId, targetObjectId].sort().join("_");
                
                setRealConversationId(room);
                
                // Tell server we are entering this room
                if (globalSocket?.connected) {
                    globalSocket.emit("join_room", room);
                }
            } catch (err) {
                console.error("ID Resolution failed:", err);
            } finally {
                setIsResolvingId(false);
            }
        };

        resolveTargetId();
    }, [targetStartup?.id, myId, globalSocket]);

    // 2. Listen for real-time messages and fetch history
    useEffect(() => {
        if (!globalSocket || !realConversationId) return;

        const handleIncoming = (msg) => {
            // Only add message if it belongs to the CURRENT active room
            if (msg.conversationId === realConversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        globalSocket.on("receive_message", handleIncoming);

        // Fetch existing history for this room
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${realConversationId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("History fetch failed:", err);
            }
        };
        fetchHistory();

        return () => {
            globalSocket.off("receive_message", handleIncoming);
        };
    }, [globalSocket, realConversationId]);

    // 3. Sync Recent Chats (Sidebar)
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await api.get('/chat/recent');
                setRecentChats(res.data);
            } catch (err) {
                console.error("Recent chats fetch failed:", err);
            }
        };
        fetchRecent();
    }, [messages]); // Refresh sidebar when new messages arrive

    // 4. Reset unread count on mount
    useEffect(() => {
        setUnreadCount(0);
    }, [setUnreadCount]);

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() || !globalSocket?.connected || !realConversationId) {
            console.warn("Socket not ready or empty text");
            return;
        }

        globalSocket.emit("send_message", {
            roomID: realConversationId,
            text: text.trim()
        });
        
        setText('');
    };

    return (
        <div className="h-screen flex pt-16 bg-white overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-80 border-r border-gray-100 flex flex-col hidden md:flex bg-gray-50/20">
                <div className="p-6 border-b border-gray-50 bg-white">
                    <h2 className="font-black text-xl tracking-tighter text-gray-800 uppercase italic">Network Comms</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {recentChats.map((chat) => (
                        <div 
                            key={chat._id}
                            onClick={() => {
                                navigate('/chat', { 
                                    state: { 
                                        targetStartup: { 
                                            id: chat.partnerDetails?.slug || chat.partnerId, 
                                            name: chat.partnerDetails?.name 
                                        } 
                                    } 
                                });
                            }}
                            className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${realConversationId === chat._id ? 'bg-white border-l-4 border-l-startup-blue shadow-sm' : 'hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {chat.partnerDetails?.logo_url ? <img src={chat.partnerDetails.logo_url} className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 truncate">{chat.partnerDetails?.name || "Unknown"}</h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                        {new Date(chat.lastTimestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 truncate pl-[52px]">{chat.lastMessage}</p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CHAT INTERFACE */}
            <main className="flex-1 flex flex-col bg-gray-50">
                {targetStartup ? (
                    <>
                        <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm z-10">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-startup-blue rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                    {targetStartup?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 uppercase tracking-tight leading-none">{targetStartup?.name}</h2>
                                    {isResolvingId ? <p className="text-[8px] font-black text-startup-blue animate-pulse uppercase mt-1">Syncing Room...</p> : <p className="text-[8px] font-black text-green-500 uppercase mt-1">Secure Channel</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, i) => {
                                const isMe = String(msg.sender) === String(myId);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-[24px] text-sm font-medium ${
                                            isMe ? 'bg-startup-blue text-white rounded-tr-none shadow-xl shadow-blue-500/10' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                                        }`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-6 bg-white border-t flex gap-4">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Write your transmission..."
                                disabled={isResolvingId}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-startup-blue/5 focus:bg-white transition-all font-bold disabled:opacity-50"
                            />
                            <button 
                                type="submit"
                                disabled={isResolvingId || !text.trim()} 
                                className="bg-startup-blue text-white px-8 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <div className="p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center">
                            <MessageSquare size={64} className="mb-6 opacity-20" />
                            <p className="font-black uppercase tracking-[0.2em] text-xs">Identity Selected Required</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}