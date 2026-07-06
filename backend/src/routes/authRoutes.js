import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin, 
  updateProfile, 
  getCandidates, 
  likeCandidate, 
  getMatches,
  sendMessage,
  getMessages,
  getActiveChatsCount,
  addExpense,
  getExpenses
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// Protected Routes
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});
router.put('/profile', protect, updateProfile);
router.get('/candidates', protect, getCandidates);
router.post('/like', protect, likeCandidate);
router.get('/matches', protect, getMatches);

// Chatterbox Routing
router.post('/chat', protect, sendMessage);
router.get('/chat/:recipientId', protect, getMessages);
router.get('/chats/count', protect, getActiveChatsCount);

// Splitwise Routing
router.post('/splits', protect, addExpense);
router.get('/splits', protect, getExpenses);

export default router;
