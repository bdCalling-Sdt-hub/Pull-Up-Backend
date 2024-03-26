const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QueryBuilder = require('../builder/QueryBuilder');
const emailWithNodemailer = require('../helpers/email');
const dayjs = require('dayjs');
const Package = require('../models/Package');
const unlinkImage = require('../common/image/unlinkImage');

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

// Forgot Password
const forgetPassword = async (userBody) => {
  const { email } = userBody;

  // Check if the user already exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  // Generate OTC (One-Time Code)
  const oneTimeCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  // Store the OTC and its expiration time in the database
  user.oneTimeCode = oneTimeCode;
  await user.save();

  // Prepare email for password reset
  const emailData = {
    email,
    subject: 'Password Reset Email',
    html: `
        <h1>Hello, ${user.name}</h1>
        <p>Your One Time Code is <h3>${oneTimeCode}</h3> to reset your password</p>
        <small>This Code is valid for 3 minutes</small>
      `
  }

  // Send email
  try {
    await emailWithNodemailer(emailData);
  } catch (emailError) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Failed to send verification email")
  }

  // Set a timeout to update the oneTimeCode to null after 1 minute
  setTimeout(async () => {
    try {
      user.oneTimeCode = null;
      await user.save();
      console.log('oneTimeCode reset to null after 3 minute');
    } catch (error) {
      console.error('Error updating oneTimeCode:', error);
    }
  }, 180000); // 3 minute in milliseconds

  // res.status(201).json({ message: 'Sent One Time Code successfully' });
  return user;

}

// Forgot Password Verify One Time Code
const forgetPasswordVerifyOneTimeCode = async (userBody) => {
  const { email, oneTimeCode } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  } else if (user.oneTimeCode === oneTimeCode) {
    user.emailVerified = true;
    await user.save();
    return user;
  } else {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Failed to verify user');
  }
}

// Reset update password
const resetUpdatePassword = async (userBody) => {
  const { email, password } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  } else {
    user.password = password;
    await user.save();
    return user;
  }
}

// Upgrade Account
const upgradeAccount = async (userBody, loginId) => {
  // console.log(accountType, location, packageDuration, activationDate, amount, currency);
  const { accountType, location, packageDuration, activationDate, mapLocation } = userBody;

  const user = await User.findOne({ _id: loginId });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  user.accountType = accountType;
  user.location = location;
  user.packageDuration = packageDuration;
  user.activationDate = activationDate;
  user.mapLocation = mapLocation;

  const expirationDay = (activationDate) => {
    return dayjs(activationDate).add(1, "day").toDate();
  };

  const expirationWeekly = (activationDate) => {
    return dayjs(activationDate).add(7, "day").toDate();
  };

  const expirationMonth = (activationDate) => {
    return dayjs(activationDate).add(1, "month").toDate();
  };

  if (packageDuration === 'daily') {
    const expirationDate = expirationDay(activationDate);
    user.expirationDate = expirationDate;
  }

  if (packageDuration === 'weekly') {
    const expirationDate = expirationWeekly(activationDate);
    user.expirationDate = expirationDate;
  }

  if (packageDuration === 'monthly') {
    const expirationDate = expirationMonth(activationDate);
    user.expirationDate = expirationDate;
  }

  user.save();

  return user;
}

// update account
const updatedAccount = async (userBody, loginEmail, file) => {
  const { businessName, businessNumber, businessEmail, businessDescription, businessWebsite, businessHours, businessLocation, name, phoneNumber, email, organisationName, organisationNumber, organisationEmail, organisationDescription, organisationWebsite, organisationLocation } = userBody;

  const user = await User.findOne({ email: loginEmail });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not Found");
  }

  if (user.accountType === 'business') {
    user.businessName = businessName;
    user.businessNumber = businessNumber;
    user.businessEmail = businessEmail;
    user.businessDescription = businessDescription;
    user.businessWebsite = businessWebsite;
    user.businessHours = businessHours;
    user.location = !businessLocation ? user.location : businessLocation;
  } else if (user.accountType === 'shopping') {
    user.name = !name ? user.name : name;
    user.phoneNumber = !phoneNumber ? user.phoneNumber : phoneNumber;
    user.email = !email ? user.email : email;
  } else if (user.accountType === 'organisation') {
    user.organisationName = organisationName;
    user.organisationNumber = organisationNumber;
    user.organisationEmail = organisationEmail;
    user.organisationDescription = organisationDescription;
    user.organisationWebsite = organisationWebsite;
    user.location = !organisationLocation ? user.location : organisationLocation;
  } else {
    throw new AppError(httpStatus[400], 'Invalid Account type')
  }

  if (file) {

    const defaultPath = 'public\\uploads\\users\\user.png';
    // console.log('req.file', file.filename, user.image.path, defaultPath);
    if (user.image.path !== defaultPath) {
      await unlinkImage(user.image.path);
    }

    user.image = {
      publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/users/${file?.filename}`,
      path: file.path
    }
  }

  const updatedUser = await user.save();
  return updatedUser;
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
  forgetPassword,
  forgetPasswordVerifyOneTimeCode,
  resetUpdatePassword,
  upgradeAccount,
  updatedAccount,

  updateUser,
  getAllUsers,
  getSingleUser
}