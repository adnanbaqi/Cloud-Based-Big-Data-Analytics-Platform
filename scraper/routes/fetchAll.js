import puppeteer from "puppeteer"; 
import fetch from "node-fetch";

const fetchAll = async () => {
  console.log("Starting scraper");
  
  // Use puppeteer.launch() without specifying executablePath
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  // Navigate to spaceweatherlive.com
  const page = await browser.newPage();
  
  // Set a larger viewport to ensure all elements are visible
  await page.setViewport({ width: 1366, height: 768 });

  console.log("Browser opened");
  await page.goto("https://www.spaceweatherlive.com/en/solar-activity.html", {
    timeout: 120000,
    waitUntil: 'networkidle2'
  });
  console.log("Page loaded");

  // Accept cookies if the popup appears
  try {
    const cookieButton = await page.$('[aria-label="Accept all"]');
    if (cookieButton) {
      await cookieButton.click();
      console.log("Accepted cookies");
      await page.waitForTimeout(1000); // Wait for popup to disappear
    }
  } catch (err) {
    console.log("No cookie popup found or error clicking it");
  }

  // Try to find all solar images using multiple selector strategies
  let responseImages = {};
  
  // Approach 1: Find all images on the page and filter by URL patterns for solar images
  try {
    const allImagesOnPage = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || '',
        id: img.id || ''
      }))
    );
    
    console.log(`Found ${allImagesOnPage.length} total images on page`);
    
    // Filter images that might be related to solar imagery
    const solarImagePatterns = [
      { pattern: /SDO.*0193/i, filename: "spaceweathersun.jpg" },
      { pattern: /SDO.*HMIIF/i, filename: "sunspot-regions.jpg" },
      { pattern: /LASCO.*C2/i, filename: "coronal-mass.jpg" },
      { pattern: /SDO.*0131/i, filename: "solarflares.jpg" },
      { pattern: /EUVI195/i, filename: "far-side.jpg" }
    ];
    
    for (const pattern of solarImagePatterns) {
      const matchingImage = allImagesOnPage.find(img => 
        pattern.pattern.test(img.src) || 
        pattern.pattern.test(img.id) || 
        pattern.pattern.test(img.alt)
      );
      
      if (matchingImage && matchingImage.src) {
        console.log(`Found matching image for ${pattern.filename}: ${matchingImage.src}`);
        
        try {
          // Download the image
          const response = await fetch(matchingImage.src);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString("base64");
            responseImages[pattern.filename] = base64Image;
          } else {
            console.log(`Failed to fetch image: ${matchingImage.src}, status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error downloading image: ${matchingImage.src}`, error.message);
        }
      } else {
        console.log(`No matching image found for ${pattern.filename}`);
      }
    }
  } catch (error) {
    console.error("Error finding solar images:", error.message);
  }
  
  // Approach 2: Try to find images in specific divs or containers
  const potentialContainers = [
    '.solar-images', 
    '#solar-observatory',
    '.solar-imagery',
    '.solar-data-container',
    '.latest-images'
  ];
  
  for (const container of potentialContainers) {
    try {
      const containerExists = await page.$(container);
      if (containerExists) {
        console.log(`Found container: ${container}`);
        
        const imagesInContainer = await page.$$eval(`${container} img`, imgs => 
          imgs.map(img => img.src)
        );
        
        console.log(`Found ${imagesInContainer.length} images in container ${container}`);
        
        // If we found images and don't have enough already, add these
        if (imagesInContainer.length > 0 && Object.keys(responseImages).length < 5) {
          for (let i = 0; i < Math.min(5, imagesInContainer.length); i++) {
            const imgSrc = imagesInContainer[i];
            const filename = `solar-image-${i+1}.jpg`;
            
            // Skip if we already have this image URL
            const alreadyHave = Object.values(responseImages).some(
              img => img === imgSrc
            );
            
            if (!alreadyHave && imgSrc) {
              try {
                console.log(`Downloading image from ${container}: ${imgSrc}`);
                const response = await fetch(imgSrc);
                if (response.ok) {
                  const buffer = await response.arrayBuffer();
                  const base64Image = Buffer.from(buffer).toString("base64");
                  responseImages[filename] = base64Image;
                }
              } catch (error) {
                console.error(`Error downloading image from ${container}:`, error.message);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`Error checking container ${container}:`, error.message);
    }
  }

  // Extract 'aria-label' values with better error handling
  let cleanedLabels = [];
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

  // Navigate to theskylive.com using the same page object
  try {
    await page.goto("https://theskylive.com/sun-info", {
      timeout: 120000,
      waitUntil: 'networkidle2'
    });

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
      } else {
        console.log(`Failed to fetch image: ${theskylivesunImgUrl}, status: ${response.status}`);
      }
    } else {
      console.log("TheSkyLive sun image not found");
    }
  } catch (error) {
    console.error("Error fetching TheSkyLive data:", error.message);
  }

  await browser.close();
  return { images: responseImages, graphData: cleanedLabels };
};

export default fetchAll;