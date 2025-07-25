const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMCQsFromTextGemini = async (text) => {
    console.log(process.env.GEMINI_API_KEY);
    
  try {
    if (!process.env.MODEL_NAME) {
      throw new Error("MODEL_NAME environment variable is not set.");
    }
    const model = await genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

    const prompt = `
You are an educational AI that generates multiple choice questions (MCQs).
From the given academic text, generate 5 MCQs with the following format:

[
  {
    "question": "What is the capital of India?",
    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    "answer": "New Delhi"
  },
  ...
]

Only return valid JSON. Here is the text:
"""${text}"""
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
   
    const textResponse = response.text();
    console.log(textResponse)

    // Try parsing output as JSON
    const jsonStart = textResponse.indexOf("[");
    const jsonEnd = textResponse.lastIndexOf("]");
    const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);
    console.log(jsonString)

    const finalJson =  JSON.parse(jsonString);

    console.log(finalJson)

    return {
      success:true,
      data:finalJson,
      
    }

   
  } catch (error) {
    console.error("Gemini MCQ generation failed:", error);
    return {
      sucess:false
    }
  }
};

module.exports = { generateMCQsFromTextGemini };
