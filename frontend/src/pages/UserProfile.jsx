import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [targetUser, setTargetUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(id === currentUser._id) {
            navigate('/profile');
            return;
        }
        const fetchData = async () => {
             try {
                 const [userRes, postsRes] = await Promise.all([
                     api.get(`/users/${id}`),
                     api.get(`/posts/user/${id}`).catch(err => {
                         if(err.response?.status === 403) {
                             setError("This account is private.");
                             return { data: [] };
                         }
                         throw err;
                     })
                 ]);
                 setTargetUser(userRes.data);
                 setPosts(postsRes.data);
             } catch(err) {
                 if(!error) setError(err.response?.data?.message || "Failed to load profile");
             } finally {
                 setLoading(false);
             }
        };
        fetchData();
    }, [id, currentUser, navigate]);

    if(loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-primary-500" size={48} /></div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-neutral-400 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back
            </button>
            
            {targetUser && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="w-32 h-32 rounded-full ring-4 ring-neutral-800 bg-gradient-to-br from-primary-600 to-fuchsia-600 flex items-center justify-center shadow-2xl relative z-10 text-white font-extrabold text-4xl overflow-hidden">
                        {targetUser.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${targetUser.avatar}`} alt="Avatar" className="w-full h-full object-cover"/> : targetUser.name[0].toUpperCase()}
                    </div>
                    <div className="text-center relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-wide flex items-center justify-center gap-2">
                           {targetUser.name} {targetUser.isPrivate && <Lock size={20} className="text-neutral-500"/>}
                        </h2>
                        <p className="text-neutral-400 mb-6">{targetUser.bio || 'Living life one post at a time! ✨'}</p>
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold mb-6 text-white border-b border-neutral-800 pb-4">Posts</h3>
            <div className="max-w-xl mx-auto">
                {error ? (
                    <div className="text-center p-8 border border-neutral-800 rounded-2xl bg-neutral-900/50">
                        <Lock className="mx-auto mb-4 text-neutral-500" size={48} />
                        <p className="text-xl font-medium text-neutral-300">{error}</p>
                        <p className="text-neutral-500 mt-2">Only approved friends can see their posts.</p>
                    </div>
                ) : posts.length === 0 ? (
                    <p className="text-center text-neutral-500 mt-10">No posts visible.</p>
                ) : (
                    posts.map(post => <PostCard key={post._id} post={post} />)
                )}
            </div>
        </div>
    );
};
export default UserProfile;
