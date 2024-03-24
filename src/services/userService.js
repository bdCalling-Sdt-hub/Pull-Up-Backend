const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QueryBuilder = require('../builder/QueryBuilder');
const emailWithNodemailer = require('../helpers/email');


// Define a map to store user timers for sign up requests
const userTimers = new Map();

// Create a new user
const addUser = async (userBody) => {
  const { name, email, phoneNumber, password, role } = userBody;

  // Check if the user already exists
  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new AppError(httpStatus.CONFLICT, "User already exists! Please login")
  }

  const oneTimeCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  // Create the user in the database
  const user = await User.create({
    name,
    email,
    phoneNumber,
    password,
    role,
    oneTimeCode
  });

  // Clear any previous timer for the user (if exists)
  if (userTimers.has(user._id)) {
    clearTimeout(userTimers.get(user._id));
  }

  // Set a new timer for the user to reset oneTimeCode after 3 minutes
  const userTimer = setTimeout(async () => {
    try {
      user.oneTimeCode = null;
      await user.save();
      console.log(`OneTimeCode for user ${user._id} reset to null after 3 minutes`)
      userTimers.delete(user._id);
    } catch (error) {
      console.error(`Error updating oneTimeCode for user ${user._id}:`, error);
    }
  }, 180000);

  // Store the timer reference in the map
  userTimers.set(user._id, userTimer);

  // Prepare email for activate user
  const emailData = {
    email,
    subject: 'Account Activation Email',
    html: `
          <h1>Hello, ${user.name}</h1>
          <p>Your One Time Code is <h3>${oneTimeCode}</h3> to reset your password</p>
          <small>This Code is valid for 3 minutes</small>
          `
  }

  try {
    emailWithNodemailer(emailData);
    console.log(emailData)
    // return res.status(201).json({ message: 'Thanks! Please check your E-mail to verify.' });
  } catch (emailError) {
    console.error('Failed to send verification email', emailError);
  }

  return user;
}

// Sign in a user
const userSignIn = async (userBody) => {
  const { email, password } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password Doesn't Match")
  }

  // Token, set the Cokkie
  const accessToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '7d' });

  return { user, accessToken };
}

// Verify Email
const emailVerification = async (userBody) => {
  const { oneTimeCode, email } = userBody;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  } else if (user.oneTimeCode === oneTimeCode) {
    user.emailVerified = true;
    // if (user.role === 'user') {
    //   user.role = 'user';
    // }
    await user.save();
    return user;
  }
}










const updateUser = async (userBody, file) => {

  const { name, userName, email } = userBody;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  user.name = !name ? user.name : name;
  user.userName = !userName ? user.userName : userName;

  if (file) {

    const defaultPath = 'public\\uploads\\users\\user.png';
    console.log('req.file', file, user.image.path, defaultPath);
    if (user.image.path !== defaultPath) {
      await unlinkImage(user.image.path);
    }

    user.image = {
      publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/users/${file?.file?.filename}`,
      path: file.path
    }
  }

  const updatedUser = await user.save();
  return updatedUser;
}

const getAllUsers = async (query) => {
  const userModel = new QueryBuilder(User.find(), query)
    .search()
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await userModel.modelQuery;
  const meta = await userModel.meta();
  return { result, meta };
}

const getSingleUser = async (id) => {
  const result = await User.findById(id)
  return result
}




module.exports = {
  addUser,
  userSignIn,
  emailVerification,



  updateUser,
  getAllUsers,
  getSingleUser
}