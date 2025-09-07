const markdownpdf = require("markdown-pdf");
const subscriptionService = require("../services/subscription.service.js");
const { ApiError } = require('../utils/apiError.js');
const Subscription = require("../models/subscription.model.js");

const exportMarkdownToPdf = async (markdown, title, res,userId, subscriptionId) => {
 
 subscriptionService.logUsage(userId,subscriptionId, "pdf_exported")
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
