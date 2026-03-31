import User from '../models/User.js';

export const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.search || req.query.keyword;
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json([]);
        }

        const keyword = {
            name: { $regex: searchQuery, $options: 'i' }
        };

        const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const followUser = async (req, res) => {
  const { targetId } = req.body;
  if(req.user._id.toString() === targetId) {
    return res.status(400).json({ message: "You cannot follow yourself."});
  }
  
  try {
    const targetUser = await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
    res.status(200).json({ message: "Successfully followed user" });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  const { targetId } = req.body;
  try {
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('followers', 'name avatar bio isPrivate');
        res.json(user.followers);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'name avatar bio isPrivate');
        res.json(user.following);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const mutualIds = user.followers.filter(followerId => 
            user.following.includes(followerId)
        );
        const friends = await User.find({ _id: { $in: mutualIds } }).select('name avatar bio isPrivate');
        res.json(friends);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({ message: "User not found" });

        user.name = req.body.name || user.name;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        if(req.body.isPrivate !== undefined) {
             user.isPrivate = req.body.isPrivate === 'true' || req.body.isPrivate === true;
        }

        if(req.file) {
            user.avatar = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            isPrivate: updatedUser.isPrivate
        });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if(!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
