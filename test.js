const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const apiKey = "2b10AiFkzcaToQc4itaO6wd4O";
const imagePath = "./flower.jpg";

async function identifyPlant() {
  try {
    // Create form data
    const formData = new FormData();

    // Add the image file
    formData.append("images", fs.createReadStream(imagePath));

    // Add the organs parameter
    formData.append("organs", "flower");

    const response = await axios.post(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(), // This sets the correct Content-Type with boundary
        },
      }
    );

    const results = response.data.results;
    if (results?.length > 0) {
      const topResult = results[0];
      console.log(
        "✅ Plant identified as:",
        topResult.species.scientificNameWithoutAuthor
      );
      console.log(
        "🌍 Common names:",
        topResult.species.commonNames?.join(", ") || "No common names available"
      );
      console.log(
        "🔍 Confidence score:",
        Math.round(topResult.score * 100) + "%"
      );

      // Safely access gbif URL if it exists
      if (topResult.species.gbif?.url) {
        console.log("🔗 More info:", topResult.species.gbif.url);
      } else {
        console.log("🔗 No additional reference URL available");
      }
    } else {
      console.log("❌ No plant could be identified.");
    }
  } catch (error) {
    console.error("🚨 Error identifying plant:", error.message);
    console.error("Details:", error.response?.data || error);
  }
}

identifyPlant();
