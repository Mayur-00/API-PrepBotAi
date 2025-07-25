const User = require("../models/user.model.js");
const {ApiError} = require("../utils/apiError.js");
const jwt = require("jsonwebtoken");


const asyncHandler = require("../utils/asyncHandler.js")


 const verifyJwt = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.
            replace("Bearer", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request!")
        };

        const decodedToken = jwt.verify(token, process.env.ACCESS_KEY);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "invalid Access Token");
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid Access Token")

    }

});

module.exports = {verifyJwt}