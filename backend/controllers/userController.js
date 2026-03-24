import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.search ? {
            name: { $regex: req.query.search, $options: 'i' }
        } : {};

        const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  if(req.user._id.toString() === receiverId) {
    return res.status(400).json({ message: "You cannot send a request to yourself."});
  }
  
  try {
    // Check if friends already
    const user = await User.findById(req.user._id);
    if(user.friends.includes(receiverId)) {
        return res.status(400).json({ message: "Already friends."});
    }

    const existingReq = await FriendRequest.findOne({
      $or: [
         { sender: req.user._id, receiver: receiverId, status: 'pending' },
         { sender: receiverId, receiver: req.user._id, status: 'pending' }
      ]
    });
    
    if(existingReq) {
      return res.status(400).json({ message: "Friend request already exists."});
    }

    const request = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId
    });
    res.status(201).json(request);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondUserRequest = async (req, res) => {
  const { requestId, status } = req.body; // status: 'accepted' | 'rejected'
  try {
    const request = await FriendRequest.findById(requestId);
    if(!request) return res.status(404).json({ message: "Request not found" });

    if(request.receiver.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to respond to this request" });
    }

    request.status = status;
    await request.save();

    if(status === 'accepted') {
        // Add to both users' friends array
        await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
        await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ receiver: req.user._id, status: 'pending' }).populate('sender', 'name avatar bio');
        res.json(requests);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'name avatar bio isPrivate');
        res.json(user.friends);
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
