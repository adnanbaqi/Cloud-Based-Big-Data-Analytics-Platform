import puppeteer from "puppeteer-core";
import fetch from "node-fetch";

const fetchAll = async () => {
  console.log("Starting scraper");
  const browser = await puppeteer.launch({
    executablePath: 'chromium',
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  // Navigate to spaceweatherlive.com
  const page = await browser.newPage();

  console.log("Browser opened");
  await page.goto("https://www.spaceweatherlive.com/en/solar-activity.html", {
    timeout: 120000,
  });
  console.log("Page loaded");

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
      console.log(img.src + " image source loop");
      return img.src;
    }, img.selector);

    console.log(`Image source URL: ${imgUrl}`);

    // Download the image
    const response = await fetch(imgUrl);
    const buffer = await response.arrayBuffer();

    // Encode the image to Base64
    const base64Image = Buffer.from(buffer).toString("base64");

    // Store in the responseImages object
    responseImages[img.filename] = base64Image;
  }

  // Extract 'aria-label' values
  const ariaLabels = await page.$$eval("path[aria-label]", (elements) =>
    elements.map((item) => item.getAttribute("aria-label"))
  );

  // Remove "GOES-16 (Primary)." from each label and trim any additional whitespace
  let cleanedLabels = ariaLabels.map((label) =>
    label.replace("GOES-16 (Primary).", "").trim()
  );

  cleanedLabels = cleanedLabels.slice(0, -3);
  cleanedLabels = cleanedLabels.map((label) => {
    const parts = label.split(",");
    const hour = parts[2].trim();
    const value = parseFloat(parts[3].trim());
    return { hour, MeV: value };
  });

  // Navigate to theskylive.com using the same page object
  await page.goto("https://theskylive.com/sun-info");

  const theskylivesunImgUrl = await page.evaluate(() => {
    const img = document.querySelector(".sun_container img");
    return img.src;
  });
  console.log(`Image source URL: ${theskylivesunImgUrl}`);
  // Download the image
  const response = await fetch(theskylivesunImgUrl);
  const buffer = await response.arrayBuffer();
  // Encode the image to Base64
  const base64Image = Buffer.from(buffer).toString("base64");
  // Store in the responseImages object
  responseImages["theskylivesun.jpg"] = base64Image;
  await browser.close();

  return { images: responseImages, graphData: cleanedLabels };
};

export default fetchAll;
