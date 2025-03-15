const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user');
const { JWT_SECRET } = require('../utils/config');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} = require('../errors/errors');

const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    const secret = speakeasy.generateSecret({
      name: 'TaylorMade',
      length: 20,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ secret: secret.base32, qrCodeUrl });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res
      .status(500)
      .json(new ServerError('Error setting up 2FA', error.message));
  }
};
const verifyTwoFactor = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }

    // console.log('User Secret:', user.twoFactorSecret);
    // console.log('Provided Token:', token);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      return res.json({ message: '2FA verification successful' });
    } else {
      return next(new UnauthorizedError('Invalid 2FA token'));
    }
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    next(new ServerError('Error verifying 2FA', error.message));
  }
};

// Admin controllers

// Create admin user
const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return next(
        new BadRequestError('Name, email, and password are required')
      );
    }

    if (!validator.isEmail(email)) {
      return next(new BadRequestError('Invalid email format'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('A user with this email already exists'));
    }

    // Hash the password and create the admin user
    const hash = await bcrypt.hash(password, 10);
    const adminUser = await User.create({
      name,
      email,
      password: hash,
      isAdmin: true,
    });

    res.status(201).json({
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return next(
      new ServerError('An error occurred while creating the admin user')
    );
  }
};

// Update user to admin
const updateToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
    next(new ServerError('Error updating user to admin', error.message));
  }
};

const createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return next(
        new BadRequestError('Name, email, and password are required')
      );
    }

    if (!validator.isEmail(email)) {
      return next(new BadRequestError('Invalid email format'));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return next(new ConflictError('User already exists'));
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    return res.status(201).send({ name: user.name, email: user.email });
  } catch (err) {
    console.error('Error in createUser:', err);
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Validation error'));
    }
    return next(new ServerError('An error occurred while creating the user'));
  }
};

// Controller function for user login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Both email and password are required'));
  }

  if (!validator.isEmail(email)) {
    return next(new BadRequestError('Invalid email format'));
  }

  try {
    // Find user by credentials
    const user = await User.findUserByCredentials(email, password);

    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString(), isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Respond with token and user details
    return res.send({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    if (err.message === 'Incorrect email or password') {
      return next(new UnauthorizedError('Incorrect email or password'));
    }
    return next(new ServerError('Authentication failed'));
  }
};

// Controller function to get the current logged-in user
const getCurrentUser = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    next(new ServerError('An error occurred while fetching the user'));
  }
};
const getAllUsers = async (req, res, next) => {
  let User = req.user.token;
  // console.log(User);

  if (!req.user || !req.user.isAdmin) {
    return next(new UnauthorizedError('Admin access required'));
  }

  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(new ServerError('An error occurred while fetching users'));
  }
};
// Controller function to update user data
const updateUser = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    );
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    return res.status(200).send(user);
  } catch (err) {
    next(new ServerError('An error occurred while updating the user'));
  }
};

module.exports = {
  createAdminUser,
  updateToAdmin,
  getCurrentUser,
  getAllUsers,
  updateUser,
  createUser,
  login,
  setupTwoFactor,
  verifyTwoFactor,
};
