#!/usr/bin/env node

const fs = require("fs");
const args = require("yargs").option("keys", {
  type: "array",
  desc: "One or more keys on which to filter",
}).argv;
console.error(args.keys);

const projects = JSON.parse(fs.readFileSync(0).toString("utf-8"));

const output = [];
for (let project of projects) {
  // From https://stackoverflow.com/questions/52888145/fastest-way-to-get-specific-fields-in-an-object-javascript
  const res = {};
  for (const key of args.keys) {
    res[key] = project[key];
  }
  output.push(res);
}
fs.writeFileSync(1, JSON.stringify(output));
