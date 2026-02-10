import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Send, ChevronLeft, MessageSquare, User } from 'lucide-react';

export default function Chat({ globalSocket, setUnreadCount }) {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef();

    const targetStartup = location.state?.targetStartup; 
    const myId = localStorage.getItem('myStartupId');

    const [messages, setMessages] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [text, setText] = useState('');

    const conversationId = (myId && targetStartup?.id) 
        ? [myId, targetStartup.id].sort().join("_") 
        : null;

    useEffect(() => {
        setUnreadCount(0);
    }, [setUnreadCount]);

    useEffect(() => {
        if (!globalSocket || !conversationId) return;

        globalSocket.emit("join_room", conversationId);
        
        const handleNewMessage = (msg) => {
            if (msg.conversationId === conversationId) {
                setMessages((prev) => [...prev, msg]);
            } else {
                setUnreadCount((prev) => prev + 1);
            }
        };

        globalSocket.on("receive_message", handleNewMessage);

        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${conversationId}`);
                setMessages(res.data);
            } catch (err) {
                console.error("History fetch failed", err);
            }
        };
        fetchHistory();

        return () => globalSocket.off("receive_message", handleNewMessage);
    }, [globalSocket, conversationId, setUnreadCount]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await api.get('/chat/recent');
                setRecentChats(res.data);
            } catch (err) {
                console.error("Error fetching recent chats:", err);
            }
        };
        fetchRecent();
    }, [messages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() || !globalSocket || !conversationId) return;

        globalSocket.emit("send_message", {
            roomID: conversationId,
            text: text
        });
        setText('');
    };

    return (
        <div className="h-screen flex pt-16 bg-white overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-80 border-r border-gray-100 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="font-black text-xl tracking-tighter text-gray-800 uppercase">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                    {recentChats.length > 0 ? recentChats.map((chat) => {
                        const partner = chat.partnerDetails;
                        const partnerId = chat.partnerId;

                        return (
                            <div 
                                key={chat._id}
                                onClick={() => {
                                    navigate('/chat', { 
                                        state: { 
                                            myId, 
                                            targetStartup: { id: partnerId, name: partner?.name || "User" } 
                                        } 
                                    });
                                }}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${conversationId === chat._id ? 'bg-white border-l-4 border-l-startup-blue shadow-sm' : 'hover:bg-gray-100'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                        {partner?.logo_url ? <img src={partner.logo_url} className="w-full h-full object-cover" /> : <User size={14} className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-gray-800 truncate">{partner?.name || "Unknown"}</h4>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold">{new Date(chat.lastTimestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate font-medium pl-11">{chat.lastMessage}</p>
                            </div>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center h-full p-10 opacity-20">
                            <MessageSquare size={48} />
                            <p className="text-xs font-black uppercase mt-4">No Chats</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* CHAT WINDOW */}
            <main className="flex-1 flex flex-col bg-gray-50">
                {targetStartup ? (
                    <>
                        <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                <ChevronLeft size={24} />
                            </button>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-startup-blue rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                    {targetStartup?.name?.charAt(0)}
                                </div>
                                <h2 className="font-bold text-gray-900 leading-tight">{targetStartup?.name}</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg, i) => {
                                const isMe = String(msg.sender) === String(myId);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-4 rounded-2xl text-sm ${
                                            isMe ? 'bg-startup-blue text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                                        }`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-startup-blue/30 text-sm"
                            />
                            <button className="bg-startup-blue text-white p-3.5 rounded-2xl hover:bg-blue-700 transition-all cursor-pointer">
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <MessageSquare size={60} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Select a conversation</p>
                    </div>
                )}
            </main>
        </div>
    );
}