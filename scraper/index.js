//imports
import express from "express";
import fetchAll from "./routes/fetchAll.js";
import fs from "fs";
import util from "util";
import cors from "cors";
import apiScraper from "./routes/apiScraper.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5001;
const app = express();
const writeFile = util.promisify(fs.writeFile); // Promisify fs.writeFile
const filePath = "result.json"; // File to store the result

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/scraper", apiScraper);

const fetchDataAndSaveToFile = async () => {
  try {
    const result = await fetchAll();

    // copy the old file to a file called old-result.json
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, "old-result.json");
    }
    
    // Save the result to a JSON file
    await writeFile(filePath, JSON.stringify(result, null, 2));
    console.log("Data fetched and saved to file");
  } catch (err) {
    // Handle the error appropriately
    console.error(err);
  }
};
await fetchDataAndSaveToFile();
// Call fetchDataAndSaveToFile every minute (60,000 milliseconds)
setInterval(fetchDataAndSaveToFile, 30 * 60 * 1000);

app.listen(port, () => console.log(`up and running on ${port}`));
