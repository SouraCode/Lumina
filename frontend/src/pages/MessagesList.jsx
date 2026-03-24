import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { MessageSquare, Loader2 } from 'lucide-react';

const MessagesList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/friends')
           .then(({ data }) => setFriends(data))
           .finally(() => setLoading(false));
    }, []);

    if(loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-primary-500" size={48} /></div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 h-full">
            <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <MessageSquare className="text-primary-500" size={32} />
                Messages
            </h2>
            
            {friends.length === 0 ? (
                <div className="text-center py-12 bg-brand-dark/50 rounded-3xl border border-brand-light/30 shadow-lg">
                    <p className="text-neutral-400 mb-4">You don't have any friends to chat with yet.</p>
                    <Link to="/search" className="text-primary-500 font-bold hover:underline">Find Friends</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {friends.map(f => (
                        <Link to={`/chat/${f._id}`} key={f._id} className="bg-brand-dark/80 p-5 rounded-2xl border border-brand-light/20 flex items-center justify-between hover:border-primary-500 hover:shadow-[0_0_15px_rgba(253,128,46,0.2)] transition-all block group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center font-bold text-white text-xl overflow-hidden shadow-inner ring-2 ring-primary-500/20">
                                    {f.avatar ? <img src={`http://localhost:5000${f.avatar}`} className="w-full h-full object-cover"/> : f.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">{f.name}</h3>
                                    <p className="text-sm text-brand-light">Click to open encrypted chat</p>
                                </div>
                            </div>
                            <div className="bg-brand text-primary-500 p-3 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-sm">
                                <MessageSquare size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessagesList;
