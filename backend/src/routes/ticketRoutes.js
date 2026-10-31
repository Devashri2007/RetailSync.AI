const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getVoiceOfCustomer,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTickets).post(createTicket);
router.route('/voice-of-customer').get(getVoiceOfCustomer);
router.route('/:id').get(getTicketById).put(updateTicket);

module.exports = router;
