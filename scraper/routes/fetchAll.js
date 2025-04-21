import puppeteer from "puppeteer";
import fetch from "node-fetch";

const fetchAll = async () => {
  console.log("Starting scraper");

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', // Correct path here
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();
  console.log("Browser opened");

  // Navigate to the first website
  await page.goto("https://www.spaceweatherlive.com/en/solar-activity.html", { timeout: 120000 });
  console.log("Page loaded");

  // Wait for the images to load by checking if a key element is present
  await page.waitForSelector("#SDO_512_0193");  // Example: waits for a specific image to be available

  const images = [
    { selector: "#SDO_512_0193", filename: "spaceweathersun.jpg" },
    { selector: "#SDO_HMIIF_512", filename: "sunspot-regions.jpg" },
    { selector: "#LASCO_C2", filename: "coronal-mass.jpg" },
    { selector: "#SDO_512_0131", filename: "solarflares.jpg" },
    { selector: "#EUVI195", filename: "far-side.jpg" },
  ];

  let responseImages = {};

  for (const img of images) {
    const imgUrl = await page.evaluate((selector) => {
      const img = document.querySelector(selector);
      if (img && img.src) {
        console.log(img.src + " image source loop");
        return img.src;
      }
      console.log(`No image found for selector: ${selector}`);
      return null;
    }, img.selector);

    if (imgUrl) {
      console.log(`Image source URL: ${imgUrl}`);
      
      // Download the image
      const response = await fetch(imgUrl);
      const buffer = await response.arrayBuffer();

      // Encode the image to Base64
      const base64Image = Buffer.from(buffer).toString("base64");

      // Store in the responseImages object with filename as the key (ID)
      responseImages[img.filename] = base64Image;
    } else {
      console.log(`Failed to fetch image for ${img.filename}`);
    }
  }

  // Extract 'aria-label' values
  const ariaLabels = await page.$$eval("path[aria-label]", (elements) =>
    elements.map((item) => item.getAttribute("aria-label"))
  );

  console.log("Aria Labels: ", ariaLabels);

  // Remove "GOES-16 (Primary)." from each label and trim any additional whitespace
  let cleanedLabels = ariaLabels.map((label) =>
    label.replace("GOES-16 (Primary).", "").trim()
  );
  cleanedLabels = cleanedLabels.slice(0, -3); // Remove the last three labels if needed

  cleanedLabels = cleanedLabels.map((label) => {
    const parts = label.split(",");
    const hour = parts[2].trim();
    const value = parseFloat(parts[3].trim());
    return { hour, MeV: value };
  });

  // Navigate to the second website
  await page.goto("https://theskylive.com/sun-info");

  // Wait for the image to load on the second page
  await page.waitForSelector(".sun_container img");

  const theskylivesunImgUrl = await page.evaluate(() => {
    const img = document.querySelector(".sun_container img");
    return img ? img.src : null;
  });

  if (theskylivesunImgUrl) {
    console.log(`Image source URL: ${theskylivesunImgUrl}`);
    
    // Download the image
    const response = await fetch(theskylivesunImgUrl);
    const buffer = await response.arrayBuffer();
    
    // Encode the image to Base64
    const base64Image = Buffer.from(buffer).toString("base64");
    
    // Store in the responseImages object
    responseImages["theskylivesun.jpg"] = base64Image;
  } else {
    console.log("Failed to fetch the Sun image from theskylive.com");
  }

  await browser.close();

  return { images: responseImages, graphData: cleanedLabels };
};

export default fetchAll;
