import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { caption, isTimeCapsule, unlockDate } = req.body;
    let mediaUrl = '';
    let mediaType = 'photo';
    if(req.file) {
        // Build an absolute URL or relative URL. Let's use relative for now, but client handles host.
        mediaUrl = `/uploads/${req.file.filename}`;
        mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'photo';
    } else {
        return res.status(400).json({ message: "Media file is required" });
    }

    const post = await Post.create({
      user: req.user._id,
      mediaUrl,
      mediaType,
      caption,
      isTimeCapsule: isTimeCapsule === 'true' || isTimeCapsule === true,
      unlockDate: unlockDate ? new Date(unlockDate) : null
    });

    res.status(201).json(post);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const following = user.following || [];
        
        // Feed algorithm: 
        // 1. Posts from users you follow
        // 2. Your own posts
        // 3. Recommended/Explore: recent posts from public accounts to fill the feed
        
        // First get posts from following and self
        const primaryUserIds = [...following, req.user._id];
        
        const mainPosts = await Post.find({ user: { $in: primaryUserIds } })
            .populate('user', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        // If main feed is too sparse, fetch public popular posts
        let recommendedPosts = [];
        if (mainPosts.length < 15) {
            recommendedPosts = await Post.find({ 
                user: { $nin: primaryUserIds }
            })
            .populate({
                path: 'user',
                match: { isPrivate: { $ne: true } },
                select: 'name avatar'
            })
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10);
            
            // Filter out posts where user is null (due to population match failure on private accounts)
            recommendedPosts = recommendedPosts.filter(p => p.user !== null);
        }

        // Combine and sort by date for a natural timeline
        const allPosts = [...mainPosts, ...recommendedPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(allPosts);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if(!targetUser) return res.status(404).json({ message: "User not found" });

        if (targetUser.isPrivate && req.user._id.toString() !== targetUser._id.toString()) {
            if (!targetUser.followers.includes(req.user._id)) {
                return res.status(403).json({ message: "This account is private and you are not following them." });
            }
        }

        const posts = await Post.find({ user: req.params.id })
            .populate('user', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: "Post not found" });

        const comment = {
            user: req.user._id,
            text: req.body.text
        };
        post.comments.push(comment);
        await post.save();
        
        const updatedPost = await Post.findById(req.params.id)
            .populate('user', 'name avatar')
            .populate('comments.user', 'name avatar');
            
        res.json(updatedPost);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: "Post not found" });

        if(post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json(post);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: "Post not found" });

        // Ensure only the creator can delete their post
        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post." });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};
