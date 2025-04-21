import puppeteer from "puppeteer";
import fetch from "node-fetch";

const fetchAll = async () => {
  console.log("Starting scraper");

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // Correct your Chrome path
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();
  console.log("Browser opened");

  await page.goto("https://www.spaceweatherlive.com/en/solar-activity.html", {
    timeout: 120000,
    waitUntil: "domcontentloaded", // wait for basic DOM load
  });
  console.log("Page loaded");

  const images = [
    { alt: "SDO 512 0193", filename: "spaceweathersun.jpg", url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg" },
    { alt: "SDO HMIIF 512", filename: "sunspot-regions.jpg", url: "https://www.spaceweatherlive.com/images/SDO/SDO_HMIIF_1024.jpg" },
    { alt: "LASCO C2", filename: "coronal-mass.jpg", url: "https://www.spaceweatherlive.com/images/GOES/CCOR_latest.jpg" },
    { alt: "SDO 512 0131", filename: "solarflares.jpg", url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0131.jpg" },
    { alt: "EUVI195", filename: "far-side.jpg", url: "https://www.spaceweatherlive.com/images/GONG/latest.jpg" },
  ];

  let responseImages = {};

  for (const img of images) {
    try {
      // Directly use the URL provided for the image
      const imgUrl = img.url;
      console.log(`Image source URL: ${imgUrl}`);
      
      const response = await fetch(imgUrl);
      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      responseImages[img.filename] = base64Image;
    } catch (error) {
      console.error(`Error processing ${img.filename}:`, error.message);
    }
  }

  // Extract 'aria-label' values
  const ariaLabels = await page.$$eval("path[aria-label]", (elements) =>
    elements.map((item) => item.getAttribute("aria-label"))
  );

  let cleanedLabels = ariaLabels
    .map((label) => label.replace("GOES-16 (Primary).", "").trim())
    .slice(0, -3)
    .map((label) => {
      const parts = label.split(",");
      const hour = parts[2]?.trim();
      const value = parseFloat(parts[3]?.trim());
      return { hour, MeV: value };
    });

  // Navigate to second site
  await page.goto("https://theskylive.com/sun-info", {
    timeout: 120000,
    waitUntil: "domcontentloaded",
  });

  try {
    const theskylivesunImgUrl = "https://theskylive.com/objects/sun/sunspots/sunspots.jpg?t?1745272801"; // Direct URL for the sun image
    console.log(`Image source URL: ${theskylivesunImgUrl}`);
    
    const response = await fetch(theskylivesunImgUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    responseImages["theskylivesun.jpg"] = base64Image;
  } catch (error) {
    console.error("Error fetching image from theskylive.com:", error.message);
  }

  await browser.close();
  console.log("Scraper finished.");

  return {
    images: responseImages,
    graphData: cleanedLabels,
  };
};

export default fetchAll;
