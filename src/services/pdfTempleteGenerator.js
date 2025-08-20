const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generatePdfTempletFromJsonGemini = async (mcqs) => {

  if (mcqs.length ===0){
    throw new Error("mcqs not be empty");
  }
    
  try {
    if (!process.env.MODEL_NAME) {
      throw new Error("MODEL_NAME environment variable is not set.");
    }
    const model = await genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

    const mcqStringified =  JSON.stringify(mcqs, null, 2)

    const prompt = `
You are an educational AI assistant. 
Given a JSON array of MCQ questions, create a well-formatted plain text template for generating a PDF. 
Format each question clearly, list the answer options (A, B, C, D), and highlight the correct answer with an asterisk (*). 
Do not include any explanations or extra text—just the formatted questions and answers.

Example format:
1. What does CSS stand for?
   A. Cascading Style Sheets *
   B. Central Style Sheets
   C. Cascading Simple Sheets
   D. Cars SUVs Sailboats

Use this format for all questions in the array.
This is the example array :
{
                        "question": "Which of the following statements is most accurate regarding the 'this' keyword in Java?",
                        "answers": [
                            {
                                "text": "It refers to the current object and can only be used to access instance variables.",
                                "correct": false
                            },
                            {
                                "text": "It is a keyword that refers to the current object and can be used to access instance variables, invoke current class methods, and invoke current class constructors.",
                                "correct": true
                            },
                            {
                                "text": "It is a keyword that allows you to create a new object of the same class within a method.",
                                "correct": false
                            },
                            {
                                "text": "It is exclusively used within static methods to refer to the class itself.",
                                "correct": false
                            }
                        ]
                    },
Here is the JSON array:
"""${mcqStringified}"""
`;


    const result = await model.generateContent(prompt);
    const response =  result.response;
   
    const textResponse = response.text();
    // console.log(textResponse)



 

    return {
      success:true,
      data:textResponse,
      
    }

   
  } catch (error) {
      //  console.error("Gemini MCQ generation failed:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = { generatePdfTempletFromJsonGemini };
