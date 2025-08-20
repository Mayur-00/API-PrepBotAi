const express = require("express");
const { verifyJwt } = require("../middlewares/auth.middleware.js");
const { getUserInfo } = require("../controllers/analytics.controller.js");

const router = express.Router();

router.get("/dashboard", verifyJwt, getUserInfo);

module.exports = router;