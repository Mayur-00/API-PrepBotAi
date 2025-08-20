const { Router } = require("express");
const { generateMcq, getMcq, getAllMcqs, submitAttempt, deleteMcq, search, exportPdf } = require("../controllers/mcq.controller.js");
const multer = require("multer");
const {verifyJwt} = require("../middlewares/auth.middleware.js")


const storage = multer.memoryStorage();
const upload = multer({storage  });




const router = Router();

router.post("/generate",verifyJwt, upload.single('pdfFile') ,generateMcq);
router.get("/get",verifyJwt ,getMcq);
router.get("/getAll",verifyJwt ,getAllMcqs);
router.put("/submit", verifyJwt, submitAttempt  );
router.get("/search", verifyJwt, search  );
router.get("/export", verifyJwt, exportPdf  );
router.delete("/delete/:id", verifyJwt, deleteMcq  );


module.exports = router;


