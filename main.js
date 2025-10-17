import fs from "fs/promises";
import 'dotenv/config';

// const TOKEN = process.env.BROWSERLESS_TOKEN;
const TOKEN = "2Sh7jVShj9uozba57224100cc67756782691204daf7aad5db";
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
  console.log("Generating PDF...");
  const startTime = performance.now();
  
  try {
    // Read the HTML content from index.html file
    console.log("Reading HTML file...");
    const htmlContent = await fs.readFile("report_template-with-sample-data.html", "utf8");
    console.log(`HTML file read successfully (${htmlContent.length} characters)`);
    
    const data = {
      html: htmlContent,
      options: {
        format: "A4",
        margin: {
          top: "30px",
          right: "30px",
          bottom: "30px",
          left: "30px",
        },
        printBackground: true,
        preferCSSPageSize: false,
      },
      // waitForFunction: {
      //   fn: "async () => { console.log('Checking readyForPDF...'); return window.readyForPDFFunc ? await window.readyForPDFFunc() : false; }",
      //   timeout: 60000, // Increased timeout to 60 seconds
      // },
      gotoOptions: {
        waitUntil: ["networkidle0"], // Wait until network is idle
        timeout: 30000,
      },
    };

    console.log("Sending request to Browserless...");
    console.log(`Request URL: ${url}`);
    console.log(`HTML content length: ${htmlContent.length} characters`);
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000); // 2 minutes timeout for the entire request

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log("Converting response to PDF buffer...");
    const pdfBuffer = await response.arrayBuffer();
    console.log(`PDF buffer size: ${pdfBuffer.byteLength} bytes`);
    
    await fs.writeFile("output_template-v2.1.pdf", Buffer.from(pdfBuffer));
    
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`PDF saved as output.pdf (${pdfBuffer.byteLength} bytes)`);
    console.log(`Total generation time: ${totalTime.toFixed(2)} seconds`);
    
  } catch (error) {
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;
    
    console.error(`Error generating PDF after ${totalTime.toFixed(2)} seconds:`, error);
    
    if (error.name === 'AbortError') {
      console.error("Request was aborted due to timeout");
    } else if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
      console.error("Headers timeout - the server took too long to respond");
      console.error("This could be due to:");
      console.error("1. Network connectivity issues");
      console.error("2. Browserless service being overloaded");
      console.error("3. Invalid token or quota exceeded");
      console.error("4. Map image API taking too long to respond");
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      console.error("Connection timeout - could not connect to Browserless service");
    }
    
    // Try to get more info about the token
    console.error("Troubleshooting steps:");
    console.error("1. Check if your Browserless token is valid");
    console.error("2. Verify your internet connection");
    console.error("3. Check Browserless service status");
    console.error("4. Try reducing waitForFunction timeout");
  }
  console.log("Generating PDF... Done");
};

generatePDF();
