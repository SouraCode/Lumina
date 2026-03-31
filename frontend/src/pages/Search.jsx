import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, UserPlus, Check, X, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Search = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [following, setFollowing] = useState([]);
    const [friends, setFriends] = useState([]);

    const fetchFriendsData = async () => {
        try {
            const [friendsRes, followingRes] = await Promise.all([
                api.get('/users/friends'),
                api.get('/users/following')
            ]);
            setFriends(friendsRes.data);
            setFollowing(followingRes.data);
        } catch(err) { }
    };

    useEffect(() => {
        fetchFriendsData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (keyword) {
                try {
                    const { data } = await api.get(`/users/search?keyword=${keyword}`);
                    setResults(data);
                } catch(err) {
                    toast.error("Failed to search users");
                }
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const searchUsers = async (e) => {
        e.preventDefault();
        // Search is handled in real-time by the useEffect hook above
    };

    const toggleFollow = async (targetId, isFollowing) => {
        try {
            if (isFollowing) {
                await api.post('/users/unfollow', { targetId });
                toast.success("Unfollowed user");
            } else {
                await api.post('/users/follow', { targetId });
                toast.success("Followed user");
            }
            fetchFriendsData();
        } catch(err) {
            toast.error(err.response?.data?.message || "Could not update follow status");
        }
    };
    return (
        <div className="max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-bold mb-8 text-white">Find Friends</h2>
            
            <form onSubmit={searchUsers} className="relative mb-12">
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
                <SearchIcon className="absolute left-4 top-4 text-neutral-500" />
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search Results */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-neutral-300">Results {results.length > 0 && `(${results.length})`}</h3>
                    {keyword.trim() === '' ? (
                        <p className="text-neutral-500">Type a name or email to find users.</p>
                    ) : results.length === 0 ? (
                        <p className="text-neutral-500">No users found.</p>
                    ) : null}
                    <div className="space-y-4">
                        {results.map(u => {
                            const isFollowing = following.some(f => f._id === u._id);
                            return (
                            <Link to={`/user/${u._id}`} key={u._id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors block">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-fuchsia-500 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
                                        {u.avatar ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${u.avatar}`} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold">{u.name}</p>
                                        <p className="text-xs text-neutral-500">{u.email}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(u._id, isFollowing); }} className={`p-2 rounded-xl text-white transition-colors text-sm font-semibold px-4 ${isFollowing ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-primary-600 hover:bg-primary-500'}`}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </Link>
                        )})}
                    </div>
                </div>

                {/* Mutual Friends */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-neutral-300">My Friends (Mutual)</h3>
                    <div className="space-y-3">
                        {friends.map(f => (
                            <div key={f._id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm font-medium text-white flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center font-bold overflow-hidden shadow-inner">
                                        {f.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${f.avatar}`} className="w-full h-full object-cover"/> : f.name[0].toUpperCase()}
                                    </div>
                                    <span className="text-base tracking-wide">{f.name}</span>
                                </div>
                                <button onClick={() => navigate(`/chat/${f._id}`)} className="p-2.5 bg-neutral-800 hover:bg-neutral-700 hover:text-primary-400 text-white rounded-xl transition-all shadow-md">
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
