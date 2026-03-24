import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Send, User } from 'lucide-react';
import moment from 'moment';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const isLocked = post.isTimeCapsule && new Date(post.unlockDate) > new Date();
    const [likes, setLikes] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [commenting, setCommenting] = useState(false);

    const handleLike = async () => {
        try {
            setIsLiked(!isLiked);
            setLikes(isLiked ? likes - 1 : likes + 1);
            await api.put(`/posts/${post._id}/like`);
        } catch(err) {
            setIsLiked(isLiked);
            setLikes(isLiked ? likes + 1 : likes - 1);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if(!commentText.trim()) return;
        setCommenting(true);
        try {
            const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
            setComments(data.comments);
            setCommentText('');
        } catch(err) {
            toast.error("Failed to add comment.");
        } finally {
            setCommenting(false);
        }
    };

    return (
        <div className="bg-brand-dark/50 border border-brand-light/20 rounded-2xl overflow-hidden mb-6 shadow-xl transition-all duration-300 hover:border-primary-500/50">
            {/* Header */}
            <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center font-bold text-white overflow-hidden shadow-inner ring-2 ring-primary-500/20">
                    {post.user.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.user.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : post.user.name?.[0].toUpperCase()}
                </div>
                <div>
                    <h4 className="font-semibold text-white tracking-wide">{post.user.name}</h4>
                    <p className="text-xs text-brand-light">{moment(post.createdAt).fromNow()}</p>
                </div>
            </div>

            {/* Media */}
            <div className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center overflow-hidden">
                {isLocked ? (
                    <div className="absolute inset-0 backdrop-blur-3xl bg-neutral-950/70 flex items-center justify-center flex-col z-10 text-center p-6 border-y border-neutral-800">
                        <Clock size={56} className="text-primary-500 mb-4 animate-bounce" />
                        <h3 className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-fuchsia-400">Time Capsule Locked</h3>
                        <p className="text-primary-200 font-medium">Unlocks {moment(post.unlockDate).fromNow()}</p>
                    </div>
                ) : null}
                
                {post.mediaType === 'video' ? (
                   <video src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} controls className={`w-full h-full max-h-96 object-contain transition-all duration-700 ${isLocked ? 'blur-3xl opacity-20 saturate-0 select-none' : ''}`}></video>
                ) : (
                   <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} className={`w-full h-full max-h-96 object-cover transition-all duration-700 ${isLocked ? 'blur-3xl opacity-20 saturate-0 select-none pointer-events-none' : ''}`} alt="Post Media" />
                )}
            </div>

            {/* Actions & Caption */}
            <div className="p-4">
                <div className="flex space-x-4 mb-3">
                    <button onClick={handleLike} className={`transition-colors flex items-center space-x-1.5 ${isLiked ? 'text-rose-500 hover:text-rose-400' : 'text-neutral-400 hover:text-white'}`}>
                        <Heart size={26} className={isLiked ? "fill-current" : ""} /> <span className="font-medium text-lg">{likes}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className={`transition-colors flex items-center space-x-1.5 ${showComments ? 'text-primary-500' : 'text-neutral-400 hover:text-white'}`}>
                        <MessageCircle size={26} /> <span className="font-medium text-lg">{comments.length}</span>
                    </button>
                </div>
                {post.caption && (
                    <p className="tracking-wide mb-2">
                        <span className="font-semibold mr-2 text-primary-100">{post.user.name}</span>
                        <span className="text-neutral-300">{post.caption}</span>
                    </p>
                )}
                
                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-brand-light/20">
                        <h4 className="text-sm font-bold text-neutral-400 mb-3">Comments</h4>
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                            {comments.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic">No comments yet. Be the first!</p>
                            ) : (
                                comments.map((c, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary-900 mt-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                             {c.user?.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${c.user.avatar}`} className="w-full h-full object-cover"/> : <User size={12} className="text-primary-300"/>}
                                        </div>
                                        <div className="bg-brand-dark rounded-xl px-3 py-2 flex-1 border border-brand-light/10">
                                            <p className="text-xs font-bold text-primary-300 mb-0.5">{c.user?.name || "Unknown"}</p>
                                            <p className="text-sm text-neutral-200">{c.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleComment} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-brand-dark border border-brand-light/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                            <button type="submit" disabled={!commentText.trim() || commenting} className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl disabled:opacity-50 transition-colors">
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
