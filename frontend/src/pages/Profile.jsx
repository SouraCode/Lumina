import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { Loader2, Edit3, Camera, X, Lock, Globe, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [friendsData, setFriendsData] = useState({ friends: [], followers: [], following: [] });
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}` : null);
    const [updating, setUpdating] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if(!user) return;
            try {
                const [postsRes, friendsRes, followersRes, followingRes] = await Promise.all([
                    api.get(`/posts/user/${user._id}`),
                    api.get('/users/friends'),
                    api.get('/users/followers'),
                    api.get('/users/following')
                ]);
                setPosts(postsRes.data);
                setFriendsData({
                    friends: friendsRes.data,
                    followers: followersRes.data,
                    following: followingRes.data
                });
            } catch(err) {} finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login', { replace: true });
    };

    const handleFileChange = (e) => {
        if(e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        formData.append('isPrivate', isPrivate);
        if(avatarFile) formData.append('avatar', avatarFile);

        try {
            const { data } = await api.put('/users/profile', formData);
            const currentUserToken = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const newUserData = { ...data, token: currentUserToken };
            setUser(newUserData);
            localStorage.setItem('userInfo', JSON.stringify(newUserData));
            toast.success("Profile updated!");
            setIsEditing(false);
        } catch(err) {
            toast.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if(loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-primary-500" size={48} /></div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="w-32 h-32 rounded-full ring-4 ring-neutral-800 bg-gradient-to-br from-primary-600 to-fuchsia-600 flex items-center justify-center shadow-2xl relative z-10 text-white font-extrabold text-4xl overflow-hidden">
                    {user?.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover"/> : user?.name?.[0].toUpperCase()}
                    {user?.isPrivate && <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"><Lock size={14} className="text-white"/></div>}
                </div>
                <div className="text-center md:text-left relative z-10 flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-wide flex items-center justify-center md:justify-start gap-2">
                       {user?.name} {user?.isPrivate ? <Lock size={18} className="text-neutral-500"/> : <Globe size={18} className="text-primary-500"/>}
                    </h2>
                    <p className="text-neutral-400 mb-6 max-w-md">{user?.bio || 'Living life one post at a time! ✨'}</p>
                </div>
                <div className="md:ml-auto flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
                    <button onClick={() => setIsEditing(true)} className="p-3 bg-neutral-800 hover:bg-primary-600 rounded-2xl text-white transition-colors flex items-center justify-center gap-2 cursor-pointer border border-neutral-700 hover:border-transparent font-medium shadow-md">
                        <Edit3 size={18} /> Edit Profile
                    </button>
                    <button onClick={handleLogout} className="p-3 bg-red-900/30 hover:bg-red-600 rounded-2xl text-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-900/50 hover:border-transparent font-medium shadow-md">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                        <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="flex justify-center mb-6">
                                <div onClick={() => fileRef.current.click()} className="relative w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-neutral-600 hover:border-primary-500 transition-colors group">
                                    {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Preview"/> : <Camera size={32} className="text-neutral-500 group-hover:text-primary-400" />}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"><Camera size={24} className="text-white"/></div>
                                </div>
                                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Bio</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24" />
                            </div>

                            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-neutral-800">
                                <div>
                                    <h4 className="font-semibold text-white">Private Account</h4>
                                    <p className="text-xs text-neutral-500">Only approved friends can see your posts</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>

                            <button type="submit" disabled={updating} className="w-full py-3 bg-gradient-to-r from-primary-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg flex justify-center items-center">
                                {updating ? <Loader2 size={24} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-neutral-800 mb-6 space-x-2 md:space-x-4 hide-scrollbar pb-2">
                {['posts', 'friends', 'followers', 'following'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 whitespace-nowrap rounded-xl transition-all font-semibold ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'posts' ? posts.length : friendsData[tab].length})
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="max-w-xl mx-auto">
                {activeTab === 'posts' && (
                    posts.length === 0 ? (
                        <p className="text-center text-neutral-500 mt-10">You haven't posted anything yet.</p>
                    ) : (
                        posts.map(post => <PostCard key={post._id} post={post} />)
                    )
                )}
                
                {['friends', 'followers', 'following'].includes(activeTab) && (
                    <div className="space-y-4">
                        {friendsData[activeTab].length === 0 ? (
                            <p className="text-center text-neutral-500 mt-10">No users found.</p>
                        ) : (
                            friendsData[activeTab].map(u => (
                                <Link to={`/user/${u._id}`} key={u._id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-fuchsia-500 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
                                            {u.avatar ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${u.avatar}`} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{u.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Profile;
