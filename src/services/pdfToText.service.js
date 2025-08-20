const PdfParse = require("pdf-parse")

const pdfToText = async (pdfBuffer) => {
    try {

        if (!pdfBuffer || !(pdfBuffer instanceof Buffer || pdfBuffer.length === 0)) {
            // Ensure the input is a Buffer
            throw new Error("Invalid input: A PDF Buffer is required.");
        }
        const result = await PdfParse(pdfBuffer)
        return {
            success:true,
            data:result.text
        };


    } catch (error) {
        console.error("Error in pdfToText service:", error);
          return {
            success:false,
            data:null,
            error:error.message
        };
    }
};



module.exports = { pdfToText }