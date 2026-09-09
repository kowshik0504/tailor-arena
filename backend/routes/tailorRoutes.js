const express = require('express');
const router = express.Router();
const tailorController = require('../controllers/tailorController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const tailorOnly = roleCheck('tailor');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/register', protect, tailorOnly, upload.fields([
  { name: 'aadharDoc', maxCount: 1 },
  { name: 'machinePhoto', maxCount: 1 }
]), tailorController.registerTailor);

router.post('/register-onboarding', protect, tailorOnly, upload.fields([
  { name: 'govtId', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'tailorPhoto', maxCount: 1 },
  { name: 'machinePhoto', maxCount: 1 },
  { name: 'shopPhoto', maxCount: 1 }
]), tailorController.registerOnboarding);

router.get('/profile', protect, tailorOnly, tailorController.getProfile);

router.post('/resubmit-verification', protect, tailorOnly, tailorController.resubmitVerification);

router.post('/pay-now', protect, tailorOnly, tailorController.payNow);
router.get('/dashboard', protect, tailorOnly, tailorController.getDashboard);
router.put('/profile', protect, tailorOnly, tailorController.updateProfile);
router.post('/profile-change-request', protect, tailorOnly, require('../controllers/tailorChangeRequests').requestProfileChange);
router.put('/rates', protect, tailorOnly, tailorController.updateRates);
router.put('/location', protect, tailorOnly, tailorController.updateLocation);
router.post('/wallet/deposit', protect, tailorOnly, tailorController.depositToWallet);
router.post('/wallet/withdraw', protect, tailorOnly, tailorController.withdrawFromWallet);

router.get('/nearby', tailorController.getNearby);
router.get('/all', tailorController.getAllTailors);
router.get('/:id', tailorController.getTailorById);

router.get('/debug-docs', async (req, res) => {
  const TailorProfile = require('../models/TailorProfile');
  const docs = await TailorProfile.find({}).select('documents aadharDocUrl machinePhotoUrl');
  res.json(docs);
});

module.exports = router;
