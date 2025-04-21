import puppeteer from "puppeteer"; 
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const fetchAll = async () => {
  console.log("Starting scraper");
  
  // Use puppeteer.launch() without specifying executablePath
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
  });

  // Navigate to spaceweatherlive.com
  const page = await browser.newPage();
  
  // Set a larger viewport to ensure all elements are visible
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Browser opened");

  let responseImages = {};
  let cleanedLabels = [];

  // Try the Space Weather Live site with screenshot approach
  try {
    await page.goto("https://www.spaceweatherlive.com/en/solar-activity.html", {
      timeout: 120000,
      waitUntil: 'networkidle2'
    });
    console.log("Space Weather Live page loaded");

    // Take a full page screenshot as a fallback
    const fullPageBuffer = await page.screenshot({ 
      fullPage: true,
      type: 'jpeg',
      quality: 80
    });
    
    const fullPageBase64 = fullPageBuffer.toString("base64");
    responseImages["full-page-screenshot.jpg"] = fullPageBase64;
    console.log("Captured full page screenshot");

    // Try to extract 'aria-label' values
    try {
      const ariaLabels = await page.$$eval("path[aria-label]", (elements) =>
        elements.map((item) => item.getAttribute("aria-label"))
      );

      if (ariaLabels && ariaLabels.length > 0) {
        // Remove "GOES-16 (Primary)." from each label and trim any additional whitespace
        cleanedLabels = ariaLabels.map((label) =>
          label.replace("GOES-16 (Primary).", "").trim()
        );

        if (cleanedLabels.length > 3) {
          cleanedLabels = cleanedLabels.slice(0, -3);
          cleanedLabels = cleanedLabels.map((label) => {
            try {
              const parts = label.split(",");
              if (parts.length >= 4) {
                const hour = parts[2] ? parts[2].trim() : "";
                const value = parts[3] ? parseFloat(parts[3].trim()) : 0;
                return { hour, MeV: value };
              }
              return null;
            } catch (err) {
              console.error(`Error parsing label: ${label}`, err.message);
              return null;
            }
          }).filter(Boolean);
        }
      }
    } catch (error) {
      console.error("Error extracting aria labels:", error.message);
    }
  } catch (error) {
    console.error("Error with Space Weather Live site:", error.message);
  }

  // Try NASA SOHO site for solar images
  try {
    await page.goto("https://soho.nascom.nasa.gov/data/realtime-images.html", {
      timeout: 120000,
      waitUntil: 'networkidle2'
    });
    console.log("NASA SOHO page loaded");

    // Check for image containers
    const imageContainers = await page.$$('.imagetile');
    console.log(`Found ${imageContainers.length} image containers on NASA SOHO page`);

    // Take screenshots of individual image containers
    if (imageContainers.length > 0) {
      for (let i = 0; i < Math.min(5, imageContainers.length); i++) {
        try {
          const container = imageContainers[i];
          const screenshot = await container.screenshot();
          const base64Image = screenshot.toString("base64");
          responseImages[`nasa-soho-image-${i+1}.jpg`] = base64Image;
          console.log(`Captured NASA SOHO image ${i+1}`);
        } catch (err) {
          console.error(`Error capturing NASA image container ${i+1}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error("Error with NASA SOHO site:", error.message);
  }

  // Try SDO site for solar images
  try {
    await page.goto("https://sdo.gsfc.nasa.gov/data/", {
      timeout: 120000,
      waitUntil: 'networkidle2'
    });
    console.log("NASA SDO page loaded");

    // Check for latest images
    const latestImages = await page.$$('td > a > img');
    console.log(`Found ${latestImages.length} image elements on NASA SDO page`);

    // Take screenshots of individual images
    if (latestImages.length > 0) {
      for (let i = 0; i < Math.min(5, latestImages.length); i++) {
        try {
          const imgElement = latestImages[i];
          const screenshot = await imgElement.screenshot();
          const base64Image = screenshot.toString("base64");
          responseImages[`nasa-sdo-image-${i+1}.jpg`] = base64Image;
          console.log(`Captured NASA SDO image ${i+1}`);
        } catch (err) {
          console.error(`Error capturing NASA SDO image ${i+1}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error("Error with NASA SDO site:", error.message);
  }

  // Navigate to theskylive.com using the same page object
  try {
    await page.goto("https://theskylive.com/sun-info", {
      timeout: 120000,
      waitUntil: 'networkidle2'
    });
    console.log("TheSkyLive page loaded");

    // Try to get the image directly
    const theskylivesunImgUrl = await page.evaluate(() => {
      const img = document.querySelector(".sun_container img");
      return img ? img.src : null;
    });
    
    if (theskylivesunImgUrl) {
      console.log(`Image source URL: ${theskylivesunImgUrl}`);
      // Download the image
      const response = await fetch(theskylivesunImgUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        // Encode the image to Base64
        const base64Image = Buffer.from(buffer).toString("base64");
        // Store in the responseImages object
        responseImages["theskylivesun.jpg"] = base64Image;
        console.log("TheSkyLive sun image captured");
      } else {
        console.log(`Failed to fetch image: ${theskylivesunImgUrl}, status: ${response.status}`);
      }
    } else {
      // Fallback to screenshot
      try {
        const sunContainer = await page.$('.sun_container');
        if (sunContainer) {
          const screenshot = await sunContainer.screenshot();
          const base64Image = screenshot.toString("base64");
          responseImages["theskylivesun-screenshot.jpg"] = base64Image;
          console.log("TheSkyLive sun container screenshot captured");
        } else {
          console.log("TheSkyLive sun container not found");
        }
      } catch (err) {
        console.error("Error capturing TheSkyLive screenshot:", err.message);
      }
    }
  } catch (error) {
    console.error("Error fetching TheSkyLive data:", error.message);
  }

  await browser.close();
  console.log(`Total images captured: ${Object.keys(responseImages).length}`);
  return { images: responseImages, graphData: cleanedLabels };
};

export default fetchAll;