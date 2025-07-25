
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError.js")
const { ApiResponse } = require("../utils/apiResponse.js");
const { pdfToText } = require("../services/pdfToText.service.js");
const { generateMCQsFromTextGemini } = require("../services/mcqGeneratorGemeni.service.js");
const Mcq = require("../models/mcq.model.js");
const mongoose = require("mongoose")



const extract = asyncHandler(async (req, res) => {

    const sessionUserId = req.user._id;
    const { title } = req.body;

    if (!title) {
        throw new ApiError(404, "please provide title")
    }

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated")
    };

    const uploadedFile = req.file;

    if (!uploadedFile || !uploadedFile.buffer) {
        throw new ApiError(400, "No File Provided !")
    }

    console.log(uploadedFile)

    const result = await pdfToText(uploadedFile.buffer);

    if (!result.sucess) {
        throw new ApiError(500, "an error occured while extracting text")
    }

    console.log("RESULT FROM pdfToText Service", result.data)
    const mcq = await generateMCQsFromTextGemini(result.data);

    if (!mcq.success) {
        throw new ApiError(500, "Failed to generate MCQs using Gemini.")
    }

    const newMcq = await Mcq.create(
        {
            owner: sessionUserId,
            title: title,
            questions: mcq.data
        }
    );

    console.log(newMcq)

    res.status(200).json(
        new ApiResponse(
            200,
            newMcq,
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

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated")
    };




    const mcq = await Mcq.findOne({ _id: id, owner: sessionUserId });

    if (!mcq) {
        throw new ApiError(404, "mcq not found");
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

    const mcqs = await Mcq.aggregate([
        {
            $match: {
                owner:sessionUserId
            }
        }
    ]);

    if(!mcqs){
        throw new ApiError(404, "mcqs not found");
    };

    res.status(200).json(
        new ApiResponse(200, mcqs, "ok")
    )
});


const submitMcq = asyncHandler(async (req, res) => {
 const sessionUserId = req.user._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated");
    };

    const {SubmittedMcq, score, mcqId} = req.body;

  if (
    SubmittedMcq === undefined ||
    score === undefined ||
    mcqId === undefined
) {
    throw new ApiError(400, "bad request");
}

    if (
    !Array.isArray(SubmittedMcq) ||
    typeof score !== "number" ||
    !mongoose.Types.ObjectId.isValid(mcqId)
) {
    throw new ApiError(400, "Invalid data types");
}

 const updatedMcq =   await Mcq.findOneAndUpdate({_id:mcqId, owner:sessionUserId, isCompleted:false, isActive:true}, {$set:{questions:SubmittedMcq, score:score, isActive:false, isCompleted:true}}, {new:true});

   if (!updatedMcq) {
        throw new ApiError(404, "mcq not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedMcq, "MCQ submitted successfully")
    );
});

const deleteMcq = asyncHandler(async (req, res)=> {

     const sessionUserId = req.user._id;

    if (!sessionUserId) {
        throw new ApiError(400, "Not Authenticated");
    };
    const {id} = req.params;

    if(id === undefined || !mongoose.Types.ObjectId.isValid(id)){
         throw new ApiError(400, "bad request");
    };

    const deletedMcq = await Mcq.findOneAndDelete({_id:id, owner:sessionUserId});

    if(!deletedMcq){
        throw new ApiError(404, "questions not found");
    };

    res.status(200).json(
        new ApiResponse(200, "questions deleted successfully")
    );
});





module.exports = { extract, getMcq, getAllMcqs, submitMcq, deleteMcq };