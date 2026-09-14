const Chat = require('../models/Chat');
const TailorProfile = require('../models/TailorProfile');
const notificationService = require('../services/notificationService');

exports.getCustomerChats = async (req, res) => {
  try {
    const chats = await Chat.find({ customer: req.user._id })
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ updatedAt: -1 });

    const uniqueChats = {};
    for (const chat of chats) {
      if (!chat.tailor) continue;
      const tailorId = chat.tailor._id.toString();
      if (!uniqueChats[tailorId]) {
        uniqueChats[tailorId] = chat;
      } else {
        if (chat.messages.length > uniqueChats[tailorId].messages.length) {
          uniqueChats[tailorId] = chat;
        }
      }
    }
    
    res.json(Object.values(uniqueChats).sort((a, b) => b.updatedAt - a.updatedAt));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTailorChats = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });

    const chats = await Chat.find({ tailor: profile._id })
      .populate('customer', 'name email')
      .sort({ updatedAt: -1 });

    const uniqueChats = {};
    for (const chat of chats) {
      if (!chat.customer) continue;
      const customerId = chat.customer._id.toString();
      if (!uniqueChats[customerId]) {
        uniqueChats[customerId] = chat;
      } else {
        if (chat.messages.length > uniqueChats[customerId].messages.length) {
          uniqueChats[customerId] = chat;
        }
      }
    }

    res.json(Object.values(uniqueChats).sort((a, b) => b.updatedAt - a.updatedAt));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrCreateChat = async (req, res) => {
  try {
    const { tailorId } = req.body;
    let chats = await Chat.find({ customer: req.user._id, tailor: tailorId });
    let chat;
    
    if (chats.length === 0) {
      chat = await Chat.create({ customer: req.user._id, tailor: tailorId, messages: [], aiEnabled: true });
    } else {
      chats.sort((a, b) => b.messages.length - a.messages.length);
      chat = chats[0];
    }
    
    const populated = await Chat.findById(chat._id)
      .populate({
        path: 'tailor',
        populate: { path: 'user', select: 'name email' }
      });
      
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { from, text, image, time, isAi, system, requiresAction } = req.body;
    
    const chat = await Chat.findById(chatId).populate('customer').populate({ path: 'tailor', populate: { path: 'user' } });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.push({ from, text, image, time, isAi, system, requiresAction });
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAiStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { aiEnabled } = req.body;
    
    const chat = await Chat.findById(chatId).populate('customer').populate({ path: 'tailor', populate: { path: 'user' } });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.aiEnabled = aiEnabled;
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
