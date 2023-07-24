const axios = require('axios')
require('dotenv').config()
import {subDays, parse} from "date-fns";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const nodemailer = require("nodemailer");

export async function runEmailService() {
  //iterate through TPL site, curl site for data and return array of all projects
  const projects = fetchFilesFromRepo();
  let filtered;
  let greeting;
  // identify projects
  switch (process.env.emailType) {
    case "stale":
      filtered = filterStale(projects);
      greeting = ""
      break;
    case "new":
      filtered = filterNew(projects);
      greeting = "";
      break;
  }
  // create body of email
  const body = formatEmail(filtered, greeting);

  //send out newly constructed email from previous step to designated contact
  await sendNodeMail(process.env.to, `Project Portal Updates: ${process.env.site}'s ${process.env.emailType} Projects`, body);

}

async function fetchFilesFromRepo() {
  const repoOwner = process.env.repoOwner
  const repoName = process.env.repoName
  const folderPath = 'content/project'
  const accessToken = process.env.PAT
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=add-example-projects&media=raw`

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    if (Array.isArray(response.data)) {
      const fileContent = response.data.map(file => {
        const fileUrl = file.download_url
        return axios.get(fileUrl).then(response => response.data)
      })

      const fileContentArray = await Promise.all(fileContent)

      let results = []

      for (let i = 0; i < response.data.length; i++) {
        const file = response.data[i]
        const fileContent = fileContentArray[i]
        results.push(fileContent)
      }
      console.log(results)
    } else {
      console.log(`No files found in the folder ${repoOwner}/${repoName}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
export function filterStale(projects) { // projects is an array of objects
  const today = new Date();
  const filtered = [];

  projects.forEach((project) => {
    const state = project.status;
    let closeDate = parse(project.opportunityCloses);
    let startDate = parse(project.startDate);
    let endDate = parse(project.endDate);
    let modifyDate = parse(project.lastModified);

    const problems = [];

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
  return filtered;
}

export function filterNew(projects, numberOfDaysBack){
  // projects is an array of objects; numberOfDaysBack is the number of days to search back from day of email
  return projects.filter(project => parse(project.created) < subDays(parse(project.created), numberOfDaysBack));
}
export function formatEmail(projects, greeting){ // filtered list of projects, json
  let dom = new JSDOM("<!DOCTYPE html>"),
      document = dom.window.document;
  const site = process.env.site;
  const greetingDiv = document.createElement("div");
  addElement("Hello,", greetingDiv);
  greetingDiv.append(document.createElement("br"));
  addElement(greeting, greetingDiv);
  document.body.append(greetingDiv);

  const projectDiv = document.createElement("div");
  addElement("<h2>Projects</h2>", projectDiv);
  if (projects.length == 0){
    addElement("No projects found", projectDiv);
  }
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

  console.debug(dom.serialize());
  return dom.serialize();
}

function addElement(text, div) {

  const newContent = document.createElement("p");
  newContent.innerHTML = text;
  div.appendChild(newContent);
}

export async function sendNodeMail(to, subject, body){

  // This smtp was set up by Brown OIT unix team -- this will only work on Brown internal network (such as BKE)
  // Auth not needed at this time
  let EMAIL_SMTP = "smtp://mail-relay.brown.edu:25";
  let transporter;
  // Initiate transporter
  if (EMAIL_SMTP !== undefined) {
    transporter = nodemailer.createTransport(EMAIL_SMTP);
  } else {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  let info = await transporter.sendMail({
    from: '"Brown Policy Lab" <no-reply@brown.edu>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });

  console.debug("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  console.debug("Full info: \n", JSON.stringify(info));
}
