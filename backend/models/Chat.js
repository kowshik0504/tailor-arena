const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'TailorProfile', required: true },
  aiEnabled: { type: Boolean, default: true },
  messages: [{
    from: { type: String, enum: ['customer', 'tailor'] },
    text: String,
    image: String,
    time: String,
    isAi: Boolean,
    system: Boolean,
    requiresAction: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
