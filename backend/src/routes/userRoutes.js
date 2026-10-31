const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/audit-logs').get(getAuditLogs);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
