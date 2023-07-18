#!/usr/bin/env node

// A script which reads an array of JSON objects from STDIN and filters them on the field "topic"
// which has to match the value given in the command line argument --topic

// Imports
const fs = require("fs");

// Command line arguments
const args = require("yargs").argv;

// Business logic
const projects = JSON.parse(fs.readFileSync(0).toString("utf-8"));

let filtered = [];
projects.forEach((project) => {
  const state = project.status;
  let closeDate = Date.parse(project.opportunityCloses);
  let startDate = Date.parse(project.startDate);
  let endDate = Date.parse(project.endDate);
  let modifyDate = Date.parse(project.lastModified);

  let problems = [];
  const today = new Date();

  switch (state) {
    default:
      break;
    case "open":
      if (closeDate < today) {
        problems.push(
          "The opportunity date has passed, but project is marked open.",
        );
      }
      if (startDate < today) {
        problems.push("The start date has passed, but project is marked open.");
      }
      if (today - modifyDate > 90) {
        problems.push(
          "It has been over 90 days since project's last modification.",
        );
      }
      if (endDate < today) {
        problems.push("The project has ended, but is marked as open.");
      }
      break;
    case "ongoing":
      if (today - modifyDate > 90) {
        problems.push(
          "It has been over 90 days since project's last modification.",
        );
      }
      if (endDate < today) {
        problems.push("The project has ended, but is marked as ongoing.");
      }
      break;
  }

  if (problems.length > 0) {
    filtered.push({ ...project, problems: problems });
  }
});
fs.writeFileSync(1, JSON.stringify(filtered));
