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
const moment = require('moment');
const fs = require('fs');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

  const oneTimeCode = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;


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
  console.log(userBody)
  const { email, password } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }
  if (user.emailVerified === false) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, "Email not verified")
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
  console.log(userBody)
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  if (user?.oneTimeCode !== oneTimeCode) {
    throw new AppError(httpStatus.FORBIDDEN, "otp did not match")
  }
  const result = await User.findByIdAndUpdate(user?._id, {
    $set: {
      emailVerified: true
    }
  })
  return result;
}

// Forgot Password
const forgetPassword = async (email) => {
  console.log(email)
  // Check if the user already exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  // Generate OTC (One-Time Code)
  const oneTimeCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 10000;

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
const forgetPasswordVerifyOneTimeCode = async (userBody, email) => {
  const { oneTimeCode } = userBody;
  console.log(oneTimeCode);
  const user = await User.findOne({ email });
  console.log(user)
  if (!user) {
    throw new AppError(400, "user not found!")
  }
  if (oneTimeCode !== user?.oneTimeCode) {
    throw new AppError(400, "otp did not match")
  }
  const result = await User.findByIdAndUpdate(user?._id, {
    $set: {
      emailVerified: true,
    }
  }, { new: true })
  return result
}

// Reset update password
const resetUpdatePassword = async (userBody, email) => {
  const { password } = userBody;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  } else {
    user.password = password;
    await user.save();
    return user;
  }
}


// Forget password for app
const forgetPasswordApp = async (userBody) => {
  const { email } = userBody;
  console.log(email)
  // Check if the user already exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  // Generate OTC (One-Time Code)
  const oneTimeCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 10000;

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

// Forgot Password Verify One Time Code for App
const forgetPasswordVerifyOneTimeCodeApp = async (userBody) => {
  const { email, oneTimeCode } = userBody;
  console.log(oneTimeCode);
  const user = await User.findOne({ email });
  console.log(user)
  if (!user) {
    throw new AppError(400, "user not found!")
  }
  if (oneTimeCode !== user?.oneTimeCode) {
    throw new AppError(400, "otp did not match")
  }
  const result = await User.findByIdAndUpdate(user?._id, {
    $set: {
      emailVerified: true,
    }
  }, { new: true })
  return result
}

// Reset update password for app
const resetUpdatePasswordApp = async (userBody) => {
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
  const { accountType, location, packageDuration, activationDate, mapLocation } = userBody;
  const mLocation = JSON.parse(mapLocation)
  const user = await User.findOne({ _id: loginId });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  const coordinates = Object.values(mLocation)
  const mapLocationData = { ...mLocation, coordinates }

  user.accountType = accountType;
  user.location = location;
  user.packageDuration = packageDuration;
  user.activationDate = activationDate;
  user.mapLocation = mapLocationData;

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
const updatedAccount = async (userBody, loginEmail, file, ip) => {
  const { dateOfBirth, businessName, businessNumber, businessEmail, businessDescription, businessWebsite, businessHours, businessLocation, name, phoneNumber, email, organisationName, organisationNumber, organisationEmail, organisationDescription, organisationWebsite, organisationLocation } = userBody;

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


    const dateComponents = dateOfBirth?.split("/");
    const day = parseInt(dateComponents[0]);
    const month = parseInt(dateComponents[1]);
    const year = parseInt(dateComponents[2]);

    const fileUpload = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fs.readFileSync(file.path),
        name: file.filename, // Replace with the actual file name
        type: file.mimetype, // Replace with the actual file type
      },
    });

    const backFileUpload = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fs.readFileSync(file.path),
        name: file.filename, // Replace with the actual file name
        type: file.mimetype, // Replace with the actual file type
      },
    });

    const frontFileId = fileUpload.id;
    const backFileId = backFileUpload.id;

    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      email: businessEmail,
      business_type: 'individual',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      business_profile: {
        mcc: '7512',
        name: businessName,
        product_description: businessDescription,
        support_address: {
          city: 'New York',
          country: 'US',
          line1: businessLocation,
          postal_code: '10001',
          state: 'NY',
        },
      },
      company: {
        address: {
          city: 'New York',
          country: 'US',
          line1: businessLocation,
          postal_code: '10001',
          state: 'NY',
        },
      },
      individual: {
        dob: {
          day: day,
          month: month,
          year: year,
        },
        email: user.email,
        first_name: user.name,
        last_name: ' ',
        id_number: '888867530',
        phone: '8888675309',
        address: {
          city: 'New York',
          country: 'US',
          line1: businessLocation,
          postal_code: '10001',
          state: 'NY',
        },
        verification: {
          document: {
            front: frontFileId, // Replace with the actual file path
            back: backFileId, // Replace with the actual file path
          },
        },
      },
      tos_acceptance: {
        // service_agreement: 'recipient',   // MX er somoy ata off thakbe
        ip: ip,
        date: Math.floor(new Date().getTime() / 1000)
      },
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: user.name,
        account_holder_type: 'individual',
        routing_number: "110000000",
        account_number: '000123456789',
      },
    });


    console.log("Account----->", account.id)

    user.stripeConnectAccountId = account.id;



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


    const dateComponents = dateOfBirth.split("/");
    const day = parseInt(dateComponents[0]);
    const month = parseInt(dateComponents[1]);
    const year = parseInt(dateComponents[2]);

    const fileUpload = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fs.readFileSync(file.path),
        name: file.filename, // Replace with the actual file name
        type: file.mimetype, // Replace with the actual file type
      },
    });

    const backFileUpload = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fs.readFileSync(file.path),
        name: file.filename, // Replace with the actual file name
        type: file.mimetype, // Replace with the actual file type
      },
    });

    const frontFileId = fileUpload.id;
    const backFileId = backFileUpload.id;

    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      email: organisationEmail,
      business_type: 'individual',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      business_profile: {
        mcc: '7512',
        name: organisationName,
        product_description: organisationDescription,
        support_address: {
          city: 'New York',
          country: 'US',
          line1: organisationLocation,
          postal_code: '10001',
          state: 'NY',
        },
      },
      company: {
        address: {
          city: 'New York',
          country: 'US',
          line1: organisationLocation,
          postal_code: '10001',
          state: 'NY',
        },
      },
      individual: {
        dob: {
          day: day,
          month: month,
          year: year,
        },
        email: user.email,
        first_name: user.name,
        last_name: ' ',
        id_number: '888867530',
        phone: '8888675309',
        address: {
          city: 'New York',
          country: 'US',
          line1: organisationLocation,
          postal_code: '10001',
          state: 'NY',
        },
        verification: {
          document: {
            front: frontFileId, // Replace with the actual file path
            back: backFileId, // Replace with the actual file path
          },
        },
      },
      tos_acceptance: {
        // service_agreement: 'recipient',   // MX er somoy ata off thakbe
        ip: ip,
        date: Math.floor(new Date().getTime() / 1000)
      },
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: user.name,
        account_holder_type: 'individual',
        routing_number: "110000000",
        account_number: '000123456789',
      },
    });

    user.stripeConnectAccountId = account.id;
  } else {
    throw new AppError(httpStatus.METHOD_NOT_ALLOWED, 'Invalid Account type')
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

// All Users
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

const getUsersStatistics = async (query) => {
  const { year, month } = query;

  // Construct the start and end dates for the specified month and year
  const startDate = new Date(year, month - 1, 1); // Month is zero-based, so we subtract 1
  const endDate = new Date(year, month, 0); // Get the last day of the specified month

  try {
    // Aggregate to get users within the specified date range
    const result = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      }
    ]);

    // Initialize statistics array with objects for each day of the month
    const statistics = Array.from({ length: endDate.getDate() }, (_, i) => ({
      name: (i + 1 < 10 ? '0' : '') + (i + 1),
      shopping: 0,
      business: 0,
      organisation: 0,
      amt: 0,
    }));

    // Update statistics based on retrieved users
    result.forEach(user => {
      const createdAt = moment(user.createdAt);
      const day = createdAt.date();
      const accountType = user.accountType;

      // Increment count for accountType if it's not null
      if (accountType) {
        const index = day - 1; // Index starts from 0
        statistics[index][accountType]++; // Increment count for the account type
        statistics[index].amt++; // Increment total count for the day
      } else {
        // If accountType is null, set the count to 0
        const index = day - 1; // Index starts from 0
        statistics[index].amt++; // Increment total count for the day
      }
    });

    return statistics;
  } catch (error) {
    console.error("Error retrieving users:", error);
    throw error;
  }
}

// Usage
(async () => {
  try {
    const statistics = await getUsersStatistics({ year: 2024, month: 1 });
  } catch (error) {
    console.error("Error:", error);
  }
})();


// Usage
(async () => {
  try {
    const statistics = await getUsersStatistics({ year: 2024, month: 1 });
  } catch (error) {
    console.error("Error:", error);
  }
})();



// Update User
const updateUser = async (userBody, file) => {

  const { name, phoneNumber, email } = userBody;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
  }

  user.name = !name ? user.name : name;
  user.phoneNumber = !phoneNumber ? user.phoneNumber : phoneNumber;

  if (file) {

    const defaultPath = 'public\\uploads\\users\\user.png';
    // console.log('req.file', file, user.image.path, defaultPath);
    if (user.image.path !== defaultPath) {
      await unlinkImage(user?.image?.path);
    }

    user.image = {
      publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/users/${file?.file?.filename}`,
      path: file.file.path
    }
  }

  const updatedUser = await user.save();
  return updatedUser;
}

const getSingleUser = async (id) => {
  const result = await User.findById(id)
  return result
}

const getChangePassword = async (body, email) => {

  const { currentPassword, newPassword, confirmPassword } = body;

  const user = await User.findOne({ email })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Current password is incorrect');
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'New password and re-typed password do not match');
  }

  user.password = newPassword;
  await user.save()

  return user;
}




module.exports = {
  addUser,
  userSignIn,
  emailVerification,
  forgetPassword,
  forgetPasswordApp,
  forgetPasswordVerifyOneTimeCode,
  forgetPasswordVerifyOneTimeCodeApp,
  resetUpdatePassword,
  resetUpdatePasswordApp,
  upgradeAccount,
  updatedAccount,
  getAllUsers,
  getUsersStatistics,
  updateUser,
  getSingleUser,
  getChangePassword
}