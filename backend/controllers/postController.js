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
        const friends = user.friends;
        const posts = await Post.find({ user: { $in: [...friends, req.user._id] } })
            .populate('user', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if(!targetUser) return res.status(404).json({ message: "User not found" });

        if (targetUser.isPrivate && req.user._id.toString() !== targetUser._id.toString()) {
            if (!targetUser.friends.includes(req.user._id)) {
                return res.status(403).json({ message: "This account is private." });
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
