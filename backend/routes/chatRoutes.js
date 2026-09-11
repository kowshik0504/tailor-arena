const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/customer', protect, roleCheck('customer'), chatController.getCustomerChats);
router.get('/tailor', protect, roleCheck('tailor'), chatController.getTailorChats);
router.post('/init', protect, roleCheck('customer'), chatController.getOrCreateChat);
router.post('/:chatId/message', protect, chatController.addMessage);
router.put('/:chatId/ai', protect, chatController.updateAiStatus);

module.exports = router;
