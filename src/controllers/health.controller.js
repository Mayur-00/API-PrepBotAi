
const { ApiResponse } = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const healthCheck = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Health check passed"));
});

module.exports = {healthCheck}