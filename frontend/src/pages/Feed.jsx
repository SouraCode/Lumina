import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { Loader2 } from 'lucide-react';

const Feed = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const { data } = await api.get('/posts/feed');
                setFeed(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center mt-32">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto pb-20">
            {feed.length === 0 ? (
                <div className="text-center mt-20 p-8 border border-neutral-800 rounded-3xl bg-neutral-900/50">
                    <p className="text-xl text-neutral-400 font-medium">No posts in your feed yet.</p>
                    <p className="text-neutral-500 mt-2">Find some friends to see their updates or create a Time Capsule!</p>
                </div>
            ) : (
                feed.map(post => <PostCard key={post._id} post={post} />)
            )}
        </div>
    );
};

export default Feed;
