#!/usr/bin/env node

const fs = require("fs");
const args = require("yargs").argv;
require("dotenv").config();
const site = process.env.site;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let dom = new JSDOM("<!DOCTYPE html>"),
  document = dom.window.document;

const greetingDiv = document.createElement("div");
addElement("Hello!", greetingDiv);
greetingDiv.append(document.createElement("br"));
document.body.append(greetingDiv);

const projectDiv = document.createElement("div");
const projects = JSON.parse(fs.readFileSync(0).toString("utf-8"));
addElement("<h2>Projects</h2>", projectDiv);
projects.forEach((project) => {
  addElement(`Project Title: ${project.title}`, projectDiv);
  addElement(`Contact Name: ${project.mainContact.name}`, projectDiv);
  addElement(`Contact Email: ${project.mainContact.email}`, projectDiv);
  addElement(`URL: ${site}/${project.slug}`, projectDiv);
  addElement(`Possible Problems: ${project.problems.join(" ")}`, projectDiv);
  projectDiv.append(document.createElement("br"));
});
document.body.append(projectDiv);

const endingDiv = document.createElement("div");
document.body.append(endingDiv);

console.log(dom.serialize());

function addElement(text, div) {
  const newContent = document.createElement("p");
  newContent.innerHTML = text;
  div.appendChild(newContent);
}
