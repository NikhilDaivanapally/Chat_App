import User from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { filterObj } from "../utils/filterObj.js";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { generateAccessAndRefreshTokens } from "../utils/GenerateToken.js";
import { sendMail } from "../services/mailer.js";
import { OTP } from "../Templates/Mail/otp.js";
import { ResetPassord } from "../Templates/Mail/resetPassword.js";
// Register process
//  user register
// otp send
// otp verify
// singup successfull navigate to home
// Register

const RegisterUser = async (req, res, next) => {
  // collect the Data from re body
  // In incoming data we get noraml data & avatar (image) to handle this we use multer & cloudinary
  const { userName, email, password, confirmPassword, about } = req.body;
  const filteredBody = filterObj(
    req.body,
    "userName",
    "email",
    "password",
    "confirmPassword",
    "about",
    "gender"
  );

  console.log(filteredBody);
  // check if any value is empty

  if (Object.values(filteredBody).some((field) => field?.trim() === "")) {
    return res.status(400).json({
      status: "error",
      message: "All fields are Required",
    });
  }
  // check if any verified user with the email exists in DB
  const existing_user = await User.findOne({ email: email });
  if (existing_user) {
    return res.status(409).json({
      status: "error",
      message: "Email already in use, Please login.",
    });
  }
  // check if the password & confirmpassword matches
  if (String(password) !== String(confirmPassword)) {
    return res.status(400).json({
      status: "error",
      message: "password and confirmPassword must be same",
    });
  }

  const avatarLocalpath = req.file?.path;

  let avatar;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
  }
  const new_user = await User.create({
    ...filteredBody,
    status: "Offline",
    avatar: avatar?.url || "",
  });

  req.userId = new_user._id;
  next();
};

// sendOTP
const sendOTP = async (req, res, next) => {
  try {
    const { userId } = req;

    // Generate OTP
    const new_otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 mins

    // Find user and update OTP and expiry time atomically
    const user = await User.findByIdAndUpdate(userId, {
      otp_expiry_time: otp_expiry_time,
    });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User Not found !",
      });
    }
    user.otp = new_otp.toString();

    await user.save({ new: true, validateModifiedOnly: true });

    // Log OTP (for debugging; remove in production)
    // console.log(new_otp);

    // Send mail logic here
    const isOtpSent = await sendMail({
      to: user.email,
      subject: "Verfication OTP ✉️",
      // text: `your OTP is ${new_otp}, This is Valid for only 10 mins`,
      html: OTP(user.userName, new_otp),
      attachments: [],
    });
    // res
    res.status(200).json({
      status: "success",
      message: "OTP Sent Successfully!",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);

    // res
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP",
    });
  }
};

// verifyOTP
const verifyOTP = async (req, res, next) => {
  console.log(req.body);
  //otp needs to be a string
  const { email, otp } = req.body;
  console.log(email, otp);
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });
  if (!user) {
    // res email invalid or Otp expires
    return res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
  }
  if (user.verified) {
    // res Email is already Verified
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }
  const isValid = await user.isOtpCorrect(otp);
  if (!isValid) {
    //res Invalid OTP
    return res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  // OTP is Correct

  user.verified = true;
  user.otp = undefined;
  user.otp_expiry_time = undefined;

  const Reguser = await user.save({ new: true, validateModifiedOnly: true });
  console.log(Reguser, "registered");
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const accessoptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    secure: true,
    sameSite: "None",
  };

  const refreshoptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 10,
    secure: true,
    sameSite: "None",
  };

  console.log(accessToken, refreshToken, "acc ref");

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessoptions)
    .cookie("refreshToken", refreshToken, refreshoptions)
    .json({
      status: "success",
      user: loggedInUser,
      message: "OTP verified and  signup successfull",
    });
};

// login
const loginUser = async (req, res, next) => {
  // Receive the data from the frontend(req.body)
  const { email, password } = req.body;
  console.log(email, password);
  // check if the data is not empty
  if (!email || !password) {
    // res All Fields are Required
    return res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
  }
  // find the user
  const user = await User.findOne({ email: email });
  // if user is empty or undefined
  if (!user) {
    // res Email does not exists
    return res.status(400).json({
      status: "error",
      message: "Email is Invalid",
    });
  }
  // check whether the password matches
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If isPasswordValid retruns false
  if (!isPasswordValid) {
    // res Invalid user Credentials
    return res.status(400).json({
      status: "error",
      message: "Incorrect password",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const accessoptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  };

  const refreshoptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 10,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessoptions)
    .cookie("refreshToken", refreshToken, refreshoptions)
    .json({
      status: "success",
      user: loggedInUser,
      message: "User logged in Successfully",
    });
};

// forgotpassword
const forgotpassword = async (req, res, next) => {
  // get users email
  const { email } = req.body;
  const isvalidemailformat = email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!isvalidemailformat) {
    return res.status(404).json({
      status: "error",
      message: "Invalid email address",
    });
  }
  const user = await User.findOne({ email: email });

  if (!user) {
    // res No User found with this Email
    return res.status(404).json({
      status: "error",
      message: "There is no user with email address.",
    });
  }
  try {
    // Generate the random reset Token hash it and set it in the DB and also set the Reset token expiry time for 10 min
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(resetToken, "resetToken");
    // send the resetURL to the email
    await sendMail({
      to: user.email,
      subject: "Password Reset 🔑",
      html: ResetPassord(user.userName, resetURL),
      attachments: [],
    });
    // res Reset Password Link sent to Email
    res.status(200).json({
      status: "success",
      message: "Password Reset URL is sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // res Error occured While Sending the Email
    res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    });
  }
};

// resetpassword
const resetpassword = async (req, res, next) => {
  // Get the token from the url using query
  // console.log(req.query)
  const { token } = req.query;
  console.log(token);
  const { NewPassword, confirmNewPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // find the user who has this hashedToken

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token expires or submission is out of Time
  if (!user) {
    // res Token is Invalid or Expired
    return res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
  }

  // update users paswword and set resetToken & expiry to undefined

  user.password = NewPassword;
  user.confirmPassword = confirmNewPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // res

  res.status(200).json({
    status: "success",
    message: "Password Reseted Successfully",
    token,
  });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      status: "success",
      message: "User logout Successfully",
    });
};

export {
  RegisterUser,
  loginUser,
  forgotpassword,
  resetpassword,
  sendOTP,
  verifyOTP,
  logout,
};
