const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/slots', bookingController.getAvailableSlots);
router.post('/', protect, roleCheck('customer'), bookingController.createBooking);
router.get('/customer', protect, roleCheck('customer'), bookingController.getCustomerBookings);
router.get('/tailor', protect, roleCheck('tailor'), bookingController.getTailorBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.put('/:id/accept', protect, roleCheck('tailor'), bookingController.acceptBooking);
router.put('/:id/reject', protect, roleCheck('tailor'), bookingController.rejectBooking);
router.put('/:id/hold', protect, roleCheck('tailor'), bookingController.holdBooking);
router.put('/:id/acknowledge', protect, roleCheck('tailor'), bookingController.acknowledgeBooking);
router.put('/:id/complete', protect, roleCheck('tailor'), bookingController.completeBooking);
router.put('/:id/reschedule', protect, roleCheck('tailor'), bookingController.rescheduleBooking);
router.put('/:id/start-work', protect, roleCheck('tailor'), bookingController.startWork);
router.put('/:id/update-slot', protect, bookingController.updateBookingSlot);

module.exports = router;
