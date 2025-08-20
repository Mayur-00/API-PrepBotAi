const { ApiError } = require("../utils/apiError.js")
const { ApiResponse } = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.model.js");
const Mcq = require("../models/mcq.model.js");
const { validateUser, validateUserSignin } = require('../utils/validateUser.js');
const { formatMsToMinutesSeconds } = require("../utils/utilities.js")


const generateAccessTokenAndRefreshToken = async (userId) => {

   const user = await User.findById(userId);
   const refreshToken = user.generateRefreshToken();
   const accessToken = user.generateAccessToken();

   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false })

   return ({ refreshToken, accessToken })
};

const register = asyncHandler(async (req, res) => {

   const { username, email, password } = req.body;

   const UserData = {
      username,
      email,
      password
   };

   // console.log(UserData)

   const { error, value } = validateUser.validate(UserData);
   if (error) {
      // console.log(error.details[0].message)
      throw new ApiError(400, error.details[0].message);
   }

   const existingUser = await User.findOne({ email: email }).select('-password -refreshToken');


   if (existingUser) {
      throw new ApiError(409, "email already exist please login")
   };




   const newUser = await User.create(
      {
         username,
         email,
         password
      }
   );

   // console.log(newUser)


   const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
   // console.log(createdUser)

   if (!createdUser) throw new ApiError(500, "something went wrong while creating user");


   res.status(200).json(
      new ApiResponse(200, createdUser, "user created successfully")
   );

});
const login = asyncHandler(async (req, res) => {

   const { email, password } = req.body;

   const { error, value } = validateUserSignin.validate({
      email, password
   });

   if (error) {
      console.log(error)
      throw new ApiError(400, error.details[0].message);
   }

   if (!email || !password) throw new ApiError(409, "all fields are required");

   const user = await User.findOne({ email: email }).select(' -refreshToken');

   if (!user) throw new ApiError(404, "user does not exists");

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) throw new ApiError(401, "invalid user credentials");

   const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

   const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const Options = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict"
   };

   return res.status(200)
      .cookie("accessToken", accessToken.toString(), Options)
      .cookie("refreshToken", refreshToken.toString(), Options)
      .json(
         new ApiResponse(200, LoggedInUser)
      )


});

const logoutUser = asyncHandler(async (req, res) => {

   await User.findOneAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   );

   const options = {
      httpOnly: true,
      secure: true
   };

   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user logged out successfully!"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {

   try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
         throw new ApiError(401, "unauthorized request")
      }
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_KEY);

      const user = await User.findById(decodedToken._id)

      if (!user) {
         throw new ApiError(401, "invalid Refresh Token")
      }

      if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
      }

      const options = {
         httpOnly: true,
         secure: true
      }

      const { accessToken, newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

      return res.status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newrefreshToken, options)
         .json(
            new ApiResponse(
               200,
               {
                  accessToken,
                  refreshToken: newrefreshToken
               },
               "accessToken refreshed"
            )
         )
   } catch (error) {
      throw new ApiError(401, error.message || "invalid RefressToken")

   }


});

const changeCurrentPassword = asyncHandler(async (req, res) => {

   const { oldPassword, newPassword } = req.body;

   const user = await User.findById(req.user?._id).select('-refreshToken');

   const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid Password");
   }

   user.password = newPassword;

   await user.save({ validateBeforeSave: false });

   return res.status(200),
      json(new ApiResponse(200, {}, "password Changed Successfully!"))



});



module.exports = { register, login, refreshAccessToken, logoutUser, changeCurrentPassword, }