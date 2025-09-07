const Attempt = require("../models/attempt.model.js");
const Mcq = require("../models/mcq.model.js");
const User = require("../models/user.model.js");
const { ApiError } = require("../utils/apiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const {formatMsToMinutesSeconds} = require("../utils/utilities.js");
const {ApiResponse} = require("../utils/apiResponse.js")


const getUserInfo = asyncHandler(async (req, res) => {
   const sessionUserId = req.user._id;
   if (!sessionUserId) {
      throw new ApiError(400, "Not Authenticated")
   };

   const user = await User.findById(sessionUserId).select('-password -refreshToken')

   const subscription = await user.getCurrentSubscription();

   if (!user) {
      throw new ApiError(404, "not found")
   };

   const stats = await Attempt.aggregate([

      {
         $match: {
            attemptedBy: sessionUserId
         }
      }, {

         $group: {
            _id: "$attemptedBy",
            avgScore: { $avg: "$score" },
            avgTime: { $avg: "$timeTaken" },
         }
      }

   ]);

   if (stats.length === 0) {
      throw new ApiError(404, "Data not found");
   };

   const mcqs = await Mcq.countDocuments({ owner: sessionUserId }).lean();
   const Attempts = await Attempt.find({ attemptedBy: sessionUserId },).lean();
   console.log(Attempts);
   

   if(!Attempts){
    throw new ApiError(404, "Attemps Not Found")
   }
   if(mcqs === undefined ||!mcqs){
    throw new ApiError(404, "An Error Occured")
   }

   const formatedtime = formatMsToMinutesSeconds(stats[0].avgTime)

   res.json(
      new ApiResponse(200, {
         averageScore: parseFloat(stats[0].avgScore?.toFixed(2) || "0.00"),
         averageTimeSpent: formatedtime,
         totalAttempts: Attempts.length || 0,
         totalMcqs: mcqs || 0,
         recent: Attempts,
         user: user,
         subscription
      }, "success")
   );


});

module.exports = {getUserInfo}