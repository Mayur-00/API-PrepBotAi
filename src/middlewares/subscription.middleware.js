const Subscription = require("../models/subscription.model.js");
const User = require("../models/user.model.js");
const UsageLog = require("../models/usage.model.js");
const { ApiError } = require("../utils/apiError.js");

const requireActiveSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const haveActiveSubscription = await user.hasActiveSubscription();

        if(!haveActiveSubscription){
            throw new ApiError(403, "Active subscription required to perform this action")
        };

        req.userSubscription = await user.getCurrentSubscription();
        next();
    } catch (error) {
        throw new ApiError(500, "Error Checking Subscription Status")
    };
};
const checkUsageLimit =  (action) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user?._id);
            
            const permission = await user.canPerformAction(action);

            if(!permission.allowed){
                throw new ApiError(403, permission.reason);
            };
            req.userSubscription = permission.subscription;
        } catch (error) {
            throw new ApiError(500, "Error checking usage limits")
            
        };
    };
};


module.exports = {requireActiveSubscription, checkUsageLimit};



