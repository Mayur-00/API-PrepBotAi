const User = require("../models/user.model.js");
const { ApiError } = require("../utils/apiError.js");
const  asyncHandler  = require("../utils/asyncHandler.js");


const checkActiveSubscriptionAndUsageLimit = (action) => {
    return asyncHandler(async (req, res, next) => {

        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new ApiError(401, "User not found"));
        }
        const IsUserHasActiveSubscription = await user.hasActiveSubscription();

        if (!IsUserHasActiveSubscription) {
            return next(new ApiError(403, "Active subscription required to perform this action"))
        };

        if(action ===""){
            req.userSubscription = await user.getCurrentSubscription();
          return next()
        }

        const permission = await user.canPerformAction(action);

        if (!permission.allowed) {
            return next(new ApiError(403, permission.reason))
        };
        req.userSubscription = permission.subscription;
        return next();
    });
}





module.exports = { checkActiveSubscriptionAndUsageLimit };



