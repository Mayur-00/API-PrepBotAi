
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError.js")
const { ApiResponse } = require("../utils/apiResponse.js");
const { pdfToText } = require("../services/pdfToText.service.js");
const { generateMCQsFromTextGemini } = require("../services/mcqGeneratorGemeni.service.js");
const Mcq = require("../models/mcq.model.js");
const mongoose = require("mongoose");
const { validateSubmit } = require("../utils/validateMcq.js");
const User = require("../models/user.model.js");
const Attempt = require("../models/attempt.model.js");
const { generatePdfTempletFromJsonGemini } = require("../services/pdfTempleteGenerator.js");
const { exportMarkdownToPdf } = require("../services/pdfGenerator.js");



const generateMcq = asyncHandler(async (req, res) => {

    const sessionUserId = req.user._id;
    const { title, difficulty, subject } = req.body;
    
    if (!title || !subject) {
       throw new ApiError(404, "please provide title or subject")
    }

    if (!sessionUserId) {
     throw new ApiError(400, "Not Authenticated")
    };

    const uploadedFile = req.file;

    if (!uploadedFile || !uploadedFile.buffer) {
      throw new ApiError(400, "No File Provided !");
    }

    // console.log(uploadedFile)

    const result = await pdfToText(uploadedFile.buffer);

    if (!result.success) {
      throw new ApiError(500, "an error occured while extracting text");
    }

    // console.log("RESULT FROM pdfToText Service", result.data)
    const mcq = await generateMCQsFromTextGemini(result.data, difficulty);

    if (!mcq.success) {
        throw new ApiError(500, "Failed to generate MCQs using Gemini.")
    }

    const newMcq = await Mcq.create(
        {
            owner: sessionUserId,
            title: title,
            questions: mcq.data,
            difficulty: difficulty,
            subject: subject

        }
    );



    res.status(200).json(
        new ApiResponse(
            200,
            { QuizId: newMcq._id },
            "mcq generated successfully"
        )
    )

});

const getMcq = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const sessionUserId = req.user._id;

    if (!id) {
        throw new ApiError(404, "id not found");
    };
       if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid MCQ id");
    }


    console.log("id: ", id)
    console.log("userid", sessionUserId)

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated")
    };




    const mcq = await Mcq.findOne({ _id: id, owner: sessionUserId }).lean();

    if (!mcq) {
      throw new ApiError(404, "mcq not found")
    };

    res.status(200).json(
        new ApiResponse(200, mcq, "ok")

    );
});

const getAllMcqs = asyncHandler(async (req, res) => {
    const sessionUserId = req.user._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated")
    };
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;


    const mcqs = await Mcq.aggregate([
        { $match: { owner: sessionUserId } },
        { $sort : {createdAt: -1} },
        { $skip :  skip},
        { $limit : limit}
    ])

    if (mcqs.length === 0) {
        throw new ApiError(404, "mcqs not found");
    };
    
    const total = await Mcq.countDocuments({ owner: sessionUserId });

    res.status(200).json(
        new ApiResponse(200, {
            mcqs,
            page,
            limit,
            total,
            toatPages: Math.ceil(total / limit)
        }, "ok")
    )
}); 

const submitAttempt = asyncHandler(async (req, res) => {
    const sessionUserId = req.user._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated");
    };

    const { score, mcqId, timeInMs } = req.body;
    
    const { error } = validateSubmit.validate({
        score,
        mcqId,
        timeInMs
});

    if (error) {
        console.log(error.details[0].message)
        throw new ApiError(400, error.details[0].message);
    };
    const newAttempt = await Attempt.create(
        {
            attemptedBy:sessionUserId,
            attemptedMcq:mcqId,
            timeTaken: timeInMs,
            score:score
        }
    );

    // const updatedMcq = await Mcq.findOneAndUpdate({ _id: mcqId,  }, { $set: { score: score, timeInMs: timeInMs }, $inc: { attempts: 1 } }, { new: true });

    if (!newAttempt) {
        throw new ApiError(404, "mcq not found");
    };


    res.status(200).json(
        new ApiResponse(200, newAttempt, "success")
    );
});

const deleteMcq = asyncHandler(async (req, res) => {

    const sessionUserId = req.user._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated");
    };
    const { id } = req.params;

    if (id === undefined || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "bad request");
    };

    const deletedMcq = await Mcq.findOneAndDelete({ _id: id, owner: sessionUserId });

    // if (!deletedMcq) {
    //     throw new ApiError(404, "questions not found");
    // };

    res.status(200).json(
        new ApiResponse(200, "questions deleted successfully")
    );
});

const search = asyncHandler(async(req, res) => {
       const sessionUserId = req.user?._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated");
    };
    const {query, difficulty} = req.query;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;


    if(query.trim().length === 0 || difficulty.trim().length ===0){
        throw new ApiError(400, "Search Query and Options are required")
    };

    const allowedDifficulties = ["easy", "medium", "hard"];
    if (!allowedDifficulties.includes(difficulty.toLowerCase())) {
        throw new ApiError(400, "Invalid difficulty value");
    }

    let searchFilter = {
         owner:sessionUserId,
                $or : [
                     {title: { $regex: query, $options: 'i' } },
                     {difficulty: { $regex: difficulty, $options: 'i' } },
                ]
    };

   

    const Mcqs = await Mcq.find(searchFilter)
    .sort({createdAt: -1})
    .limit(limit)
    .skip(skip)
    .lean();

    if(Mcqs.length === 0){
       return res.status(404).json(
            new ApiResponse(404 , [],  "mcqs not found")
        );
    };

    res.status(200).json(
        new ApiResponse(200, Mcqs, "ok")
    );



});

const exportPdf = asyncHandler(async (req, res) => {
 const { id } = req.query;
    const sessionUserId = req.user._id;

    if (!id) {
        throw new ApiError(404, "id not found");
    };
       if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid MCQ id");
    };

    const mcq = await Mcq.findById(id)

    if(!mcq){
        throw new ApiError(404, "Mcq not Found")
    };
  
    const mcqArray = mcq.questions

    const AiResponse = await generatePdfTempletFromJsonGemini(mcqArray);

    if(!AiResponse.success){
        throw new ApiError(500, AiResponse.message)
    };

    exportMarkdownToPdf(AiResponse.data, mcq.title, res);
})


module.exports = { generateMcq, getMcq, getAllMcqs, submitAttempt, deleteMcq, search, exportPdf };