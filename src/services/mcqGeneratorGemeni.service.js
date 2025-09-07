const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMCQsFromTextGemini = async (text, difficulty) => {

  if (text ===''){
    throw new Error("text should not be empty");
  }
    console.log(process.env.GEMINI_API_KEY);
    
  try {
    if (!process.env.MODEL_NAME) {
      throw new Error("MODEL_NAME environment variable is not set.");
    }
    const model = await genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

    const prompt = `
You are an educational AI that generates multiple choice questions (MCQs).
From the given academic text,analyze the text and generate 10 most important and frequently asked MCQs with the difficulty of "${difficulty}" with the following format:

[
     {
        question: "What does CSS stand for?",
        answers: [
            { text: "Cascading Style Sheets", correct: true },
            { text: "Central Style Sheets", correct: false },
            { text: "Cascading Simple Sheets", correct: false },
            { text: "Cars SUVs Sailboats", correct: false }
        ]
    },
  ...
]

Only return valid JSON. Here is the text:
"""${text}"""
`;

    const result = await model.generateContent(prompt);
    const response =  result.response;
   
    const textResponse = response.text();
    // console.log(textResponse)


    // Try parsing output as JSON
    const jsonStart = textResponse.indexOf("[");
    const jsonEnd = textResponse.lastIndexOf("]");
    const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);


   let finalJson;
    try {
      finalJson = JSON.parse(jsonString);
    } catch (parseError) {
      // console.error("Failed to parse Gemini output as JSON:", parseError);
      return {
        success: false,
        message: "AI output was not valid JSON.",
        rawOutput: textResponse,
        error:parseError
      };
    }
 

    return {
      success:true,
      data:finalJson,
      
    }

   
  } catch (error) {
      //  console.error("Gemini MCQ generation failed:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { generateMCQsFromTextGemini };
