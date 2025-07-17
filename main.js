import fs from "fs/promises";
import 'dotenv/config';

const TOKEN = process.env.BROWSERLESS_TOKEN;
if (!TOKEN) {
  console.error("Error: BROWSERLESS_TOKEN environment variable is not set");
  process.exit(1);
}

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
        format: "A4",
      },
      waitForFunction: {
        fn: "async () => { return window.readyForPDF ? await window.readyForPDF() : false; }",
        timeout: 30000, // Wait up to 30 seconds for the map to load
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
