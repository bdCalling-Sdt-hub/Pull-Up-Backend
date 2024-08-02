const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const uploadFileToStripe = async (file) => {
  const fileUpload = await stripe.files.create({
    purpose: "identity_document",
    file: {
      data: fs.readFileSync(file.path),
      name: file.filename,
      type: file.mimetype,
    },
  });
  return fileUpload.id;
};

const parseDateOfBirth = (dateOfBirth) => {
  const [day, month, year] = dateOfBirth.split("/").map(Number);
  return { day, month, year };
};

const setUserLocation = (user, locationData) => {
  user.location = locationData?.city || user.location;
  return {
    city: locationData?.city,
    country: locationData?.country,
    line1: locationData?.line1,
    postal_code: locationData?.postal_code,
    state: locationData?.state,
  };
};

const createStripeAccount = async (user, userBody, ip, fileIds) => {
  const { day, month, year } = parseDateOfBirth(userBody.dateOfBirth);
  const locationData = JSON.parse(
    userBody.businessLocation || userBody.organisationLocation
  );

  return await stripe.accounts.create({
    type: "custom",
    country: "US",
    email: userBody.businessEmail || userBody.organisationEmail,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: "7512",
      name: userBody.businessName || userBody.organisationName,
      product_description:
        userBody.businessDescription || userBody.organisationDescription,
      support_address: setUserLocation(user, locationData),
    },
    company: {
      address: setUserLocation(user, locationData),
    },
    individual: {
      dob: { day, month, year },
      email: user.email,
      first_name: user.name,
      last_name: " ",
      id_number: "888867530",
      phone: userBody.businessNumber || userBody.organisationNumber,
      address: setUserLocation(user, locationData),
      verification: {
        document: {
          front: fileIds.frontFileId,
          back: fileIds.backFileId,
        },
      },
    },
    tos_acceptance: {
      ip: ip,
      date: Math.floor(Date.now() / 1000),
    },
    external_account: {
      object: "bank_account",
      country: "US",
      currency: "usd",
      account_holder_name: userBody.account_holder_name,
      account_holder_type: userBody.account_holder_type,
      routing_number: userBody.routing_number,
      account_number: userBody.account_number,
    },
  });
};

module.exports = {
  uploadFileToStripe,
  parseDateOfBirth,
  setUserLocation,
  createStripeAccount,
};
