const PdfParse = require("pdf-parse")

const pdfToText = async (pdfBuffer) => {
    try {

        if (!pdfBuffer || !(pdfBuffer instanceof Buffer)) {
            // Ensure the input is a Buffer
            throw new Error("Invalid input: A PDF Buffer is required.");
        }
        const result = await PdfParse(pdfBuffer)
        return {
            sucess:true,
            data:result.text
        };


    } catch (error) {
        console.error("Error in pdfToText service:", error);
          return {
            sucess:false,
            data:null,
            error:error
        };
    }
};



module.exports = { pdfToText }