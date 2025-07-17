import fs from "fs/promises";

const TOKEN = "2Sh7jVShj9uozba474ea5989877be1a61a17b7a22b58e0e9f";
const url = `https://production-sfo.browserless.io/pdf?token=${TOKEN}`;
const headers = {
  "Cache-Control": "no-cache",
  "Content-Type": "application/json",
};

const generatePDF = async () => {
  try {
    // Read the HTML content from index.html file
    const htmlContent = await fs.readFile("index.html", "utf8");
    
    const data = {
      html: htmlContent,
      options: {
        displayHeaderFooter: true,
        printBackground: false,
        format: "A0",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const pdfBuffer = await response.arrayBuffer();
    await fs.writeFile("output.pdf", Buffer.from(pdfBuffer));
    console.log("PDF saved as output.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

generatePDF();
