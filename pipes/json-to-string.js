#!/usr/bin/env node

// No-Op: Parse the incoming JSON (represented as a string) and print the string representation.
const fs = require("fs");
const json = JSON.parse(fs.readFileSync(0).toString("utf-8"));
fs.writeFileSync(1, JSON.stringify(json, null, 2));
