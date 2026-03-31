import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Send, User, Bookmark, MoreHorizontal } from 'lucide-react';
import moment from 'moment';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const isLocked = post.isTimeCapsule && new Date(post.unlockDate) > new Date();
    const [likes, setLikes] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [commenting, setCommenting] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    if (isDeleted) return null;

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

    const handleDoubleTap = async () => {
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 800);
        if(!isLiked) {
            await handleLike();
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/posts/${post._id}`);
            setIsDeleted(true);
            toast.success("Post deleted");
        } catch(err) {
            toast.error("Failed to delete post");
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
        <div className="bg-black border-b border-neutral-900 overflow-hidden mb-6 md:border md:border-neutral-800 md:rounded-lg">
            {/* Header */}
            <div className="p-3 flex items-center justify-between relative">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center font-bold text-white overflow-hidden ring-2 ring-primary-500/20">
                        {post.user.avatar ? <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.user.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : post.user.name?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white text-sm">{post.user.name} <span className="text-neutral-500 font-normal ml-1">• {moment(post.createdAt).fromNow(true)}</span></h4>
                    </div>
                </div>
                
                {user?._id === post.user._id && (
                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="text-neutral-400 hover:text-white transition-colors p-1 relative z-10">
                            <MoreHorizontal size={20} />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-32 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-red-500 hover:bg-neutral-800 text-sm font-semibold transition-colors">
                                    Delete Post
                                </button>
                            </div>
                        )}
                        {showOptions && <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />}
                    </div>
                )}
            </div>

            {/* Media */}
            <div 
                className="relative bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer w-full"
                onDoubleClick={handleDoubleTap}
            >
                {/* Heart Overlay Animation */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.25, type: "spring" }}
                            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none drop-shadow-2xl"
                        >
                            <Heart size={100} className="fill-white text-white drop-shadow-lg" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLocked ? (
                    <div className="absolute inset-0 backdrop-blur-3xl bg-neutral-950/70 flex items-center justify-center flex-col z-10 text-center p-6 border-y border-neutral-800">
                        <Clock size={48} className="text-white mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold mb-2 text-white">Time Capsule</h3>
                        <p className="text-neutral-300 text-sm">Unlocks {moment(post.unlockDate).fromNow()}</p>
                    </div>
                ) : null}
                
                {post.mediaType === 'video' ? (
                   <video src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} controls className={`w-full max-h-[700px] object-cover transition-all duration-700 ${isLocked ? 'blur-3xl opacity-20 saturate-0 select-none' : ''}`}></video>
                ) : (
                   <img src={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} className={`w-full max-h-[700px] object-cover transition-all duration-700 ${isLocked ? 'blur-3xl opacity-20 saturate-0 select-none pointer-events-none' : ''}`} alt="Post Media" />
                )}
            </div>

            {/* Actions & Caption */}
            <div className="p-3 pt-2">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex space-x-4">
                        <button onClick={handleLike} className={`transition-transform active:scale-75 ${isLiked ? 'text-rose-500' : 'text-white hover:text-neutral-400'}`}>
                            <Heart size={26} className={isLiked ? "fill-current" : ""} />
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="text-white hover:text-neutral-400 transition-colors">
                            <MessageCircle size={26} />
                        </button>
                        <button className="text-white hover:text-neutral-400 transition-colors">
                            <Send size={26} />
                        </button>
                    </div>
                    <button className="text-white hover:text-neutral-400 transition-colors">
                        <Bookmark size={26} />
                    </button>
                </div>
                
                <p className="font-semibold text-sm text-white mb-1">{likes} likes</p>
                
                {post.caption && (
                    <p className="text-sm text-white leading-relaxed mb-1">
                        <span className="font-bold mr-2">{post.user.name}</span>
                        {post.caption}
                    </p>
                )}
                
                {/* Comments Section */}
                {comments.length > 0 && (
                    <button onClick={() => setShowComments(!showComments)} className="text-neutral-500 text-sm font-medium mb-1 hover:text-neutral-400 transition-colors text-left block">
                        {showComments ? "Hide comments" : `View all ${comments.length} comments`}
                    </button>
                )}

                {showComments && comments.length > 0 && (
                    <div className="mt-2 mb-3 space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                         {comments.map((c, i) => (
                             <div key={i} className="flex gap-2 text-sm leading-snug">
                                <span className="font-bold text-white shrink-0">{c.user?.name || "Unknown"}</span>
                                <span className="text-white break-words">{c.text}</span>
                             </div>
                         ))}
                    </div>
                )}

                <form onSubmit={handleComment} className="flex items-center mt-2 group relative">
                    <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-neutral-500 py-1"
                    />
                    {commentText.trim() && (
                        <button type="submit" disabled={commenting} className="text-primary-500 font-semibold text-sm hover:text-white transition-colors absolute right-0 bg-black pl-2">
                            Post
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostCard;
