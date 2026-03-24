import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
    try {
        const { friendId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: friendId },
                { sender: friendId, receiver: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first

        res.json(messages);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};
