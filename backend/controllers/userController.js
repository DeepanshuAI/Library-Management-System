import User from '../models/User.js';

// @desc    Get all users/members
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new student member
// @route   POST /api/users
// @access  Private (Admin)
const addUser = async (req, res) => {
  try {
    const { name, email, phone, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'A member with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      studentId: studentId || '',
      password: 'student123', // default password (students don't log in)
      role: 'user',
      finesAmount: 0,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentId: user.studentId,
      role: user.role,
      finesAmount: user.finesAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a student member
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Member not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account.' });
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'Member removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay/clear fines for a user
// @route   PUT /api/users/:id/pay-fines
// @access  Private
const payFines = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.finesAmount = 0;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        finesAmount: updatedUser.finesAmount,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUsers, addUser, deleteUser, payFines };
