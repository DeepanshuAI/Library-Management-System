import express from 'express';
import { getUsers, addUser, deleteUser, payFines } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getUsers).post(protect, addUser);
router.route('/:id').delete(protect, deleteUser);
router.route('/:id/pay-fines').put(protect, payFines);

export default router;
