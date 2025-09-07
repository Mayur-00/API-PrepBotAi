const { Router } = require("express");
const { generateMcq, getMcq, getAllMcqs, submitAttempt, deleteMcq, search, exportPdf } = require("../controllers/mcq.controller.js");
const multer = require("multer");
const {verifyJwt} = require("../middlewares/auth.middleware.js");

const {checkActiveSubscriptionAndUsageLimit, checkUsageLimit} = require("../middlewares/subscription.middleware.js")


const storage = multer.memoryStorage();
const upload = multer({storage  });




const router = Router();

router.post("/generate",verifyJwt, checkActiveSubscriptionAndUsageLimit("generate_mcq"), upload.single('pdfFile') ,generateMcq);
router.get("/get",verifyJwt,checkActiveSubscriptionAndUsageLimit(""),  getMcq);
router.get("/getAll",verifyJwt,  checkActiveSubscriptionAndUsageLimit(""), getAllMcqs);
router.put("/submit", verifyJwt, checkActiveSubscriptionAndUsageLimit(""), submitAttempt  );
router.get("/search", verifyJwt,  search  );
router.get("/export", verifyJwt,  checkActiveSubscriptionAndUsageLimit("export_pdf"),exportPdf  );
router.delete("/delete/:id", verifyJwt, checkActiveSubscriptionAndUsageLimit(""), deleteMcq  );


module.exports = router;


