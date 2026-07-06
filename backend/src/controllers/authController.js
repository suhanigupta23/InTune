import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Expense from '../models/Expense.js';
import generateAnon from '../utils/generateAnon.js';

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register User
export const registerUser = async (req, res) => {
  const { name, email, phone, password, gender, isVerified, maskedAadhaar } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: 'All fields required' });

  try {
    // Check if email or phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ msg: 'Account already exists with this email address' });

    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) return res.status(400).json({ msg: 'Account already exists with this phone number' });
    }

    const avatarSeed = Math.random().toString(36).substring(7);

    const user = await User.create({
      name,
      email,
      phone,
      password,
      anonymousId: generateAnon(),
      gender,
      isVerified: !!isVerified,
      maskedAadhaar,
      avatarSeed
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      anonymousId: user.anonymousId,
      token: genToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ msg: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      anonymousId: user.anonymousId,
      token: genToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Google Login / Register
export const googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;
  if (!email || !name)
    return res.status(400).json({ msg: 'Email and name are required' });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Account does not exist. Please sign up first!' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      anonymousId: user.anonymousId,
      token: genToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Update Profile (e.g. Save Voice Assessment Vibe Description)
export const updateProfile = async (req, res) => {
  const { vibeText } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (vibeText !== undefined) user.vibeText = vibeText;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      anonymousId: user.anonymousId,
      vibeText: user.vibeText
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Get verified roommate candidates (excluding self, showing only anonymized profiles)
export const getCandidates = async (req, res) => {
  try {
    // Find all verified users who aren't the current user
    const users = await User.find({
      _id: { $ne: req.user._id },
      isVerified: true
    }).select('anonymousId vibeText avatarSeed');

    // Return the anonymized user records
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Like/Swipe a candidate
export const likeCandidate = async (req, res) => {
  const { candidateId, like } = req.body;
  if (!candidateId) return res.status(400).json({ msg: 'Candidate ID required' });

  try {
    const userA = req.user._id.toString();
    const userB = candidateId.toString();

    // Alphabetical ordering to keep index keys consistent
    const [firstUser, secondUser] = userA < userB ? [userA, userB] : [userB, userA];

    let match = await Match.findOne({ userA: firstUser, userB: secondUser });
    if (!match) {
      match = new Match({
        userA: firstUser,
        userB: secondUser,
        userALiked: userA === firstUser ? like : false,
        userBLiked: userA === secondUser ? like : false,
        status: 'pending'
      });
    } else {
      if (userA === firstUser) match.userALiked = like;
      if (userA === secondUser) match.userBLiked = like;

      if (match.userALiked && match.userBLiked) {
        match.status = 'matched';
      }
    }

    await match.save();
    res.json({
      matchStatus: match.status,
      isMatch: match.status === 'matched'
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Get revealed matches
export const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find matches where current user is userA or userB and status is 'matched'
    const matches = await Match.find({
      $or: [{ userA: userId }, { userB: userId }],
      status: 'matched'
    }).populate('userA', 'name email anonymousId avatarSeed').populate('userB', 'name email anonymousId avatarSeed');

    const result = matches.map(m => {
      const otherUser = m.userA._id.toString() === userId.toString() ? m.userB : m.userA;
      return {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        anonymousId: otherUser.anonymousId,
        avatarSeed: otherUser.avatarSeed,
        status: m.status
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Chatterbox Chat - Send Message
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content)
    return res.status(400).json({ msg: 'Receiver ID and content are required' });

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Chatterbox Chat - Get Message History
export const getMessages = async (req, res) => {
  const { recipientId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: recipientId },
        { sender: recipientId, receiver: req.user._id }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Chatterbox Chat - Get Active Conversations Count
export const getActiveChatsCount = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    const activeUsers = new Set();
    messages.forEach(m => {
      if (m.sender.toString() !== req.user._id.toString()) {
        activeUsers.add(m.sender.toString());
      }
      if (m.receiver.toString() !== req.user._id.toString()) {
        activeUsers.add(m.receiver.toString());
      }
    });

    res.json({ count: activeUsers.size });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Splits - Add shared expense
export const addExpense = async (req, res) => {
  const { amount, description, splitWith, category } = req.body;
  if (!amount || !description || !splitWith)
    return res.status(400).json({ msg: 'Amount, description and split roommate required' });

  try {
    const expense = await Expense.create({
      amount,
      description,
      paidBy: req.user._id,
      splitWith,
      category: category || 'General'
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

// Splits - Get shared expenses between current user and roommate
export const getExpenses = async (req, res) => {
  const { roommateId } = req.query;
  if (!roommateId) return res.status(400).json({ msg: 'Roommate ID required' });

  try {
    const userId = req.user._id;
    const expenses = await Expense.find({
      $or: [
        { paidBy: userId, splitWith: roommateId },
        { paidBy: roommateId, splitWith: userId }
      ]
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err: err.message });
  }
};
