#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const repoOwner = process.env.repoOwner;
const repoName = process.env.repoName;
const repoBranch = process.env.repoBranch;
const accessToken = process.env.PAT;
const folderPath = "content/project";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${repoBranch}&media=raw`;
console.error(apiUrl);

async function fetchFilesFromRepo() {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (Array.isArray(response.data)) {
      const fileContent = response.data.map((file) => {
        const fileUrl = file.download_url;
        return axios.get(fileUrl).then((response) => response.data);
      });

      const fileContentArray = await Promise.all(fileContent);

      let results = [];

      for (let i = 0; i < response.data.length; i++) {
        const file = response.data[i];
        const fileContent = fileContentArray[i];
        results.push(fileContent);
      }
      fs.writeFileSync(1, JSON.stringify(results));
    } else {
      console.error(`No files found in the folder ${repoOwner}/${repoName}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchFilesFromRepo();
