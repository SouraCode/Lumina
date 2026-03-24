import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import api from '../lib/api';
import CryptoJS from 'crypto-js';
import { Send, Lock, ArrowLeft, Key, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ENDPOINT = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socket;

const Chat = () => {
    const { id: friendId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [friend, setFriend] = useState(null);
    const scrollRef = useRef();
    
    // Automatically generate a unique, cryptographically symmetrical key using both participant IDs! 
    // This allows seamless E2EE without asking the user for a manual unlock password.
    const autoSharedSecret = [user._id, friendId].sort().join('-AES-Lumina-');

    useEffect(() => {
        socket = io(ENDPOINT, { query: { userId: user._id } });
        socket.emit('setup', user._id);

        api.get(`/users/${friendId}`).then(({ data }) => setFriend(data)).catch();
        api.get(`/messages/${friendId}`).then(({ data }) => setMessages(data)).catch();

        socket.on('receiveMessage', (msg) => {
            if(msg.sender === friendId || msg.receiver === friendId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        socket.on('messageDeleted', (msgId) => {
            setMessages(prev => prev.filter(m => m._id !== msgId));
        });

        socket.on('chatCleared', ({ senderId }) => {
            if (senderId === friendId) {
                setMessages([]);
                toast.success("The other user cleared the chat.");
            }
        });
        return () => socket.disconnect();
    }, [user, friendId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if(!newMessage.trim()) return;
        
        // Encrypt using the frictionless derived key
        const encryptedContent = CryptoJS.AES.encrypt(newMessage, autoSharedSecret).toString();

        const msgObj = {
            senderId: user._id,
            receiverId: friendId,
            content: encryptedContent,
        };
        
        socket.emit('sendMessage', msgObj, (savedMsg) => {
            setMessages(prev => [...prev, savedMsg]);
        });
        setNewMessage('');
    };

    const decryptMessage = (encryptedText) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, autoSharedSecret);
            const original = bytes.toString(CryptoJS.enc.Utf8);
            return original || "🔒 Decrypt Error";
        } catch(e) {
            return "🔒 Decrypt Error";
        }
    };

    const handleClearChat = () => {
        if (!window.confirm("Are you sure you want to permanently delete this entire chat history for both of you?")) return;
        socket.emit('clearChat', { senderId: user._id, receiverId: friendId });
        setMessages([]);
        toast.success("Chat history cleared.");
    };

    const handleDeleteMessage = (msgId) => {
        socket.emit('deleteMessage', { messageId, receiverId: friendId });
        setMessages(prev => prev.filter(m => m._id !== msgId));
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-opacity-30 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Chat Header */}
            <div className="p-4 bg-black/40 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center font-bold text-white shadow-inner">
                            {friend?.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${friend.avatar}`} className="w-full h-full object-cover rounded-full"/> : friend?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{friend?.name || "Loading..."}</h3>
                            <p className="text-xs text-primary-400 flex items-center gap-1"><Lock size={10}/> E2E Encrypted</p>
                        </div>
                    </div>
                </div>
                <button onClick={handleClearChat} className="p-2 text-red-500 hover:text-red-400 hover:bg-brand-light/20 rounded-xl transition-all font-bold text-sm flex items-center gap-2">
                    <Trash2 size={18} /> Clear
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50">
                        <Lock size={48} className="mb-4 text-primary-900" />
                        <p>No messages yet. Say hello secretly!</p>
                    </div>
                )}
                {messages.map((m, i) => {
                    const isMe = m.sender === user._id;
                    const decryptedText = decryptMessage(m.content);
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group max-w-full`}>
                            {isMe && m._id && (
                                <button onClick={() => handleDeleteMessage(m._id)} title="Delete message" className="mr-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition-all self-center">
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <div className={`max-w-[75%] p-4 rounded-2xl shadow-md ${isMe ? 'bg-gradient-to-br from-primary-600 to-fuchsia-600 text-white rounded-tr-sm' : 'bg-brand-dark text-neutral-100 rounded-tl-sm border border-brand-light/30'}`}>
                                <p className="text-[15px] leading-relaxed break-words">{decryptedText}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-neutral-800 flex gap-3 z-10">
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type an encrypted message..." 
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl text-white transition-all shadow-lg flex items-center justify-center">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
