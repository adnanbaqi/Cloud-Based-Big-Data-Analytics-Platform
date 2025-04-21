import express from "express";
import fetchAll from "./fetchAll.js";
import fs from "fs";
import util from "util";

const router = express.Router();
const writeFile = util.promisify(fs.writeFile); // Promisify fs.writeFile
const filePath = "result.json"; // File to store the result

router.get("/all-images-and-aria-labels", async (req, res) => {
  try {
    let result;
    let oldResult;
    if (fs.existsSync(filePath)) {
      // If file exists, read the file and parse it as JSON
      result = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (fs.existsSync("old-result.json")) {
        // If old-result.json exists, read the file and parse it as JSON
        oldResult = JSON.parse(fs.readFileSync("old-result.json", "utf8"));
      }
    } else {
      // If file does not exist, fetch data
      result = await fetchAll();

      // Save the result to a JSON file
      await writeFile(filePath, JSON.stringify(result, null, 2));
    }

    res.status(200).json({ result, oldResult });
  } catch (err) {
    // Handle the error appropriately
    console.error(err);
    res.status(500).send("An error occurred while fetching data");
  }
});

export default router;
