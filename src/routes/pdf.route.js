const { Router } = require("express");
const { extract, getMcq, getAllMcqs, submitMcq, deleteMcq } = require("../controllers/pdf.controller.js");
const multer = require("multer");
const {verifyJwt} = require("../middlewares/auth.middleware.js")


const storage = multer.memoryStorage();
const upload = multer({storage  });




const router = Router();

router.post("/generate",verifyJwt, upload.single('pdfFile') ,extract);
router.get("/get",verifyJwt ,getMcq);
router.get("/getAll",verifyJwt ,getAllMcqs);
router.post("/submit", verifyJwt, submitMcq  )
router.delete("/delete/:id", verifyJwt, deleteMcq  )


module.exports = router


