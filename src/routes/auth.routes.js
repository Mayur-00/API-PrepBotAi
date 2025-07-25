const {Router} = require("express");
const {verifyJwt} = require("../middlewares/auth.middleware.js")
const {register, login, logoutUser, getCurrentUser, refreshAccessToken} = require("../controllers/user.controller.js");

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logoutUser",verifyJwt, logoutUser);
router.get("/getUserDetails", verifyJwt, getCurrentUser);
router.post("/renewAccess", verifyJwt, refreshAccessToken);

module.exports = router;