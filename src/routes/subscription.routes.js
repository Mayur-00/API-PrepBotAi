const {createSubscriptionOrder, verifyPayment, getPlans} = require("../controllers/subscription.controller.js");
const express = require("express");
const { verifyJwt } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/create-order",verifyJwt ,createSubscriptionOrder)
router.post("/verify-payment",verifyJwt ,verifyPayment);
router.get("/get-plans", getPlans);


module.exports = router