const express = require('express');
const router = express.Router();
const {
  getPendingTailors, verifyTailor, getChangeRequests,
  approveChangeRequest, rejectChangeRequest, getSystemHealth, verifyAadhar, deleteTailor,
  getAlerts, resolveAlert
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// All admin routes are protected and require the 'admin' role
router.use(protect);
router.use(roleCheck('admin'));

router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);

router.get('/stats', require('../controllers/adminStats').getDashboardStats);
router.get('/activity', require('../controllers/adminActivity').getRecentActivity);
router.get('/reports', require('../controllers/adminReports').getReportsData);
router.get('/payments', require('../controllers/adminPayments').getPaymentsData);

router.get('/pending-tailors', getPendingTailors);
router.put('/verify-tailor/:id', verifyTailor);
router.delete('/tailors/:id', deleteTailor);
router.put('/verify-aadhar/:id', verifyAadhar);
router.get('/change-requests', getChangeRequests);
router.put('/approve-change/:id', approveChangeRequest);
router.put('/reject-change/:id', rejectChangeRequest);
router.get('/system-health', getSystemHealth);

module.exports = router;
