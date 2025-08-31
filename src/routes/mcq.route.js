const { Router } = require("express");
const { generateMcq, getMcq, getAllMcqs, submitAttempt, deleteMcq, search, exportPdf } = require("../controllers/mcq.controller.js");
const multer = require("multer");
const {verifyJwt} = require("../middlewares/auth.middleware.js");

const {requireActiveSubscription, checkUsageLimit} = require("../middlewares/subscription.middleware.js")


const storage = multer.memoryStorage();
const upload = multer({storage  });




const router = Router();

router.post("/generate",verifyJwt, requireActiveSubscription, checkUsageLimit("generate_mcq"), upload.single('pdfFile') ,generateMcq);
router.get("/get",verifyJwt,requireActiveSubscription,  getMcq);
router.get("/getAll",verifyJwt,  requireActiveSubscription, getAllMcqs);
router.put("/submit", verifyJwt, requireActiveSubscription, submitAttempt  );
router.get("/search", verifyJwt,  search  );
router.get("/export", verifyJwt,  requireActiveSubscription,checkUsageLimit("export_pdf"), exportPdf  );
router.delete("/delete/:id", verifyJwt, requireActiveSubscription, deleteMcq  );


module.exports = router;


