const axios = require('axios')
require('dotenv').config()
import {subDays, isAfter, differenceInDays} from "date-fns";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const nodemailer = require("nodemailer");

export async function runEmailService() {

  const repoOwner = process.env.repoOwner
  const repoName = process.env.repoName
  const accessToken = process.env.PAT
  //iterate through TPL site, curl site for data and return array of all projects
  const projects = await fetchFilesFromRepo(repoOwner, repoName, accessToken)
  let filtered;
  let greeting;
  // identify projects
  switch (process.env.emailType) {
    case "Stale":
      filtered = filterStale(projects);
      greeting = ""
      break;
    case "New":
      filtered = filterNew(projects);
      greeting = "";
      break;
  }

  // create body of email
  const body = formatEmail(filtered, greeting);

  //identify stale projects, create html body of email

  //send out newly constructed email from previous step to designated contact
  const emails = await fetchEmailsFromRepo(repoOwner, repoName, accessToken)
  await sendNodeMail(process.env.to, `Project Portal Updates: ${process.env.site}'s ${process.env.emailType} Projects`, body);

}


async function fetchEmailsFromRepo(repoOwner, repoName, accessToken) {

  const getEmailsPath = 'content/config/email-service-contacts.json'
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`

  try {

    const emailsUrl = `${apiUrl}/${getEmailsPath}?ref=main&media=raw`
    const response = await axios.get(emailsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    const downloadEmailsUrl = response.data.download_url
    const downloadEmailsResponse = await axios.get(downloadEmailsUrl)
    return downloadEmailsResponse.data.contacts.map(contact => contact.email)

  } catch (error) {
    console.error('Error with fetchEmailsFromRepo():', error)
  }
  return []
}

async function fetchFilesFromRepo(repoOwner, repoName, accessToken) {

  const getProjectsPath = 'content/project'
  const getContactsPath = 'content/contact'
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`

  try {

    const projectsUrl = `${apiUrl}/${getProjectsPath}?ref=main&media=raw`
    const contactsUrl = `${apiUrl}/${getContactsPath}?ref=main&media=raw`

    const [projectsResponse, contactsResponse] = await Promise.all([
      axios.get(projectsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }),
      axios.get(contactsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
    ])


    if (Array.isArray(contactsResponse.data) && Array.isArray(projectsResponse.data)) {

      const contactsContent = contactsResponse.data
        .filter(file => file.name.endsWith('.json'))
        .map(file => {
          const fileUrl = file.download_url
          return axios.get(fileUrl).then(response => response.data)
        })

      const contactsContentArray = await Promise.all(contactsContent)

      const contactsMap = new Map()
      let index = 0

      contactsResponse.data.forEach((file) => {
        if (file.name.endsWith('.json')) {
          const fileName = file.name
          const fileData = contactsContentArray[index++]
          contactsMap.set(fileName.replace(/\.json$/, ''), fileData)
        }
      })

      const projectsContent = projectsResponse.data.map(file => {
        const fileUrl = file.download_url
        return axios.get(fileUrl).then(response => ({
          ...response.data,
          slug: file.name.replace(/\.json$/, ''),
        }))
      })
      const projectsContentArray = await Promise.all(projectsContent)

      let projectResults = []

      for (let i = 0; i < projectsResponse.data.length; i++) {
        const projectContent = projectsContentArray[i]
        const contactSlug = projectContent.mainContact
        projectContent.mainContact = contactsMap.get(contactSlug)
        projectResults.push(projectContent)
      }

      return projectResults

    } else {
      console.error(`No files found in the folder ${repoOwner}/${repoName}`)
    }
  } catch (error) {
    console.error('Error with fetchFilesFromRepo():', error)
  }
  return []
}
export function filterStale(projects) {
  const todayDate = new Date()
  const filtered = []

  projects.forEach((project) => {
    const state = project.status
    let closeDate = null
    if (project.opportunityCloses && project.opportunityCloses !== '') {
      closeDate = new Date(project.opportunityCloses)
    }
    let startDate = null
    if (project.startDate && project.startDate !== '') {
      startDate = new Date(project.startDate)
    }
    let endDate = null
    if (project.endDate && project.endDate !== '') {
      endDate = new Date(project.endDate)
    }
    const modifyDate = new Date(project.lastModified)

    const problems = []

    switch (state) {
      default:
        break
      case "open":
        if (isAfter(todayDate, closeDate)) {
          problems.push(
              "The opportunity closes date has passed, but project is marked open.",
          )
        }
        if (isAfter(todayDate, startDate)) {
          problems.push("The project start date has passed, but project is marked open.")
        }
        if (differenceInDays(todayDate, modifyDate) > 90) {
          problems.push(
              "It has been over 90 days since project's last modification.",
          )
        }
        if (isAfter(todayDate, endDate)) {
          problems.push("The project end date has passed, but project is marked open.")
        }
        break
      case "ongoing":
        if (differenceInDays(todayDate, modifyDate) > 90) {
          problems.push(
              "It has been over 90 days since project's last modification.",
          )
        }
        if (isAfter(todayDate, endDate)) {
          problems.push("The project end date has passed, but project is marked open.")
        }
        break
    }

    if (problems.length > 0) {
      filtered.push({ ...project, problems: problems })
    }
  });
  return filtered
}

export function filterNew(projects, numberOfDaysBack){
  // projects is an array of objects; numberOfDaysBack is the number of days to search back from day of email
  return projects.filter(project => parse(project.created) < subDays(parse(project.created), numberOfDaysBack))
}
export function formatEmail(projects, greeting){ // filtered list of projects, json

  function addElement(text, div) {
    const newContent = document.createElement("p")
    newContent.innerHTML = text
    div.appendChild(newContent)
  }

  let dom = new JSDOM("<!DOCTYPE html>"),
    document = dom.window.document
  const site = process.env.site
  const greetingDiv = document.createElement("div")
  addElement("Hello,", greetingDiv)
  greetingDiv.append(document.createElement("br"))
  addElement(greeting, greetingDiv)
  document.body.append(greetingDiv)

  const projectDiv = document.createElement("div")
  addElement("<h2>Projects</h2>", projectDiv)
  if (projects.length === 0){
    addElement("No projects found", projectDiv)
  }
  projects.forEach((project) => {
    addElement(`Project Title: ${project.title}`, projectDiv)
    addElement(`Contact Name: ${project.mainContact.name}`, projectDiv)
    addElement(`Contact Email: ${project.mainContact.email}`, projectDiv)
    addElement(`URL: ${site}/${project.slug}`, projectDiv)
    addElement(`Possible Problems: ${project.problems.join(" ")}`, projectDiv)
    projectDiv.append(document.createElement("br"))
  })
  document.body.append(projectDiv)

  const endingDiv = document.createElement("div")
  document.body.append(endingDiv)

  console.debug(dom.serialize())
  return dom.serialize()
}


export async function sendNodeMail(to, subject, body){

  // This smtp was set up by Brown OIT unix team -- this will only work on Brown internal network (such as BKE)
  // Auth not needed at this time
  let EMAIL_SMTP = "smtp://mail-relay.brown.edu:25"
  let transporter
  // Initiate transporter
  if (EMAIL_SMTP !== undefined) {
    transporter = nodemailer.createTransport(EMAIL_SMTP)
  } else {
    let testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })
  }

  let info = await transporter.sendMail({
    from: '"Brown Policy Lab" <no-reply@brown.edu>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  })

  console.debug("Message sent: %s", info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  console.debug("Full info: \n", JSON.stringify(info))
}
