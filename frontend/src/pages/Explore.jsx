import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExplore = async () => {
            try {
                // Actually reusing /posts/feed is fine if it aggregates all visible.
                // Or you could make an explore endpoint. For now, /posts/feed provides public posts too.
                const { data } = await api.get('/posts/feed');
                // Optional: randomize order.
                setPosts(data.sort(() => 0.5 - Math.random()));
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        fetchExplore();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-white md:hidden">Explore</h2>
            
            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.length === 0 ? (
                    <div className="col-span-3 text-center mt-20 p-8 border border-neutral-800 rounded-3xl bg-neutral-900/50">
                        <p className="text-xl text-neutral-400 font-medium">No posts to explore.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post._id} className="relative aspect-square bg-neutral-900 overflow-hidden md:rounded-xl group">
                            {post.mediaType === 'video' ? (
                                <video src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.mediaUrl}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Explore Post" />
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="flex gap-4 font-bold text-white">
                                    <span>♥ {post.likes?.length || 0}</span>
                                    <span>💬 {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Explore;
