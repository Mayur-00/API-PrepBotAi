const markdownpdf = require("markdown-pdf");

const { ApiError } = require('../utils/apiError.js');

const exportMarkdownToPdf = (markdown, title, res) => {
 
    try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

    markdownpdf()
      .from.string(markdown)
      .to.buffer({}, function(err, buffer) {
          if (err) throw err;
          res.end(buffer);
      });


    } catch (error) {
     
        throw new ApiError(500, "Pdf Generation Failed")
        
    }
};

module.exports = { exportMarkdownToPdf };
