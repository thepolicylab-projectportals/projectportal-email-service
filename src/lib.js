const axios = require('axios')
require('dotenv').config()
import {subDays, subMonths, isAfter, differenceInDays, format, parseISO} from "date-fns";
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
  // identify desired projects
  switch (process.env.emailType) {
    case "Stale":
      filtered = filterStale(projects);
      greeting = `We hope this email finds you well. As part of our email update, we are pleased to provide you with a status report on stale projects at ${process.env.site}`
      break;
    case "New":
      filtered = filterNew(projects);
      greeting = `We hope this email finds you well. As part of our email update, we are pleased to provide you with a status report on new projects at ${process.env.site}`
      break;
  }

  // create body of email
  const body = formatEmail(filtered, greeting);

  //send out newly constructed email from previous step to designated contact
  const emails = await fetchEmailsFromRepo(repoOwner, repoName, accessToken)

  let emailTitle = `${process.env.site} ${process.env.emailType} Projects Update`

  if (filtered.length === 0){
    emailTitle = `${process.env.site} ${process.env.emailType} Projects Update: No ${process.env.emailType} Projects`
  }
  await sendNodeMail(emails, emailTitle, body);

}


async function fetchEmailsFromRepo(repoOwner, repoName, accessToken) {
  const getEmailsPath = 'content/config/email-service-contacts.json'
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`

  try {
    const emailsUrl = `${apiUrl}/${getEmailsPath}?ref=${process.env.branch}&media=raw`
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
  let projectResults = []

  try {
    const projectsUrl = `${apiUrl}/${getProjectsPath}?ref=${process.env.branch}&media=raw`
    const contactsUrl = `${apiUrl}/${getContactsPath}?ref=${process.env.branch}&media=raw`

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

    const contactsMap = new Map()

    if (contactsResponse.status === 200){
      const contactsContent = contactsResponse.data
        .filter(file => file.name.endsWith('.json'))
        .map(file => {
          const fileUrl = file.download_url
          return axios.get(fileUrl).then(response => response.data)
        })

      const contactsContentReturned = await Promise.all(contactsContent)

      let index = 0
      contactsResponse.data.forEach((file) => {
        if (file.name.endsWith('.json')) {
          const fileName = file.name
          const fileData = contactsContentReturned[index++]
          contactsMap.set(fileName.replace(/\.json$/, ''), fileData)
        }
      })
    }

    if (projectsResponse.status === 200){
      const projectsContent = projectsResponse.data.map(file => {
        const fileUrl = file.download_url
        return axios.get(fileUrl).then(response => ({
          ...response.data,
          slug: file.name.replace(/\.json$/, ''),
        }))
      })
      const projectsContentReturned = await Promise.all(projectsContent)

      projectsContentReturned.forEach(projectContent =>
      {
        const contactSlug = projectContent.mainContact
        projectContent.mainContact = contactsMap.get(contactSlug)
        if (contactsMap.has(contactSlug)) {
          projectContent.mainContact = contactsMap.get(contactSlug)
        }
        projectResults.push(projectContent)
      })
    }

  } catch (error) {
    console.error('Error with fetchFilesFromRepo():', error)
  }
  return projectResults
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

export function filterNew(projects){
  // projects is an array of objects
  const todayDate = new Date()

  if (process.env.subMonths){
    return projects.filter(project => isAfter(parseISO(project.created), subMonths(todayDate, parseInt(process.env.subMonths))))
  }
  return projects.filter(project => isAfter(parseISO(project.created), subDays(todayDate, parseInt(process.env.subDays))))
}

export function formatEmail(projects, greeting){ // filtered list of projects, json

  function addElement(text, div, type) {
    const newContent = document.createElement(`${type}`)
    newContent.innerHTML = text
    div.appendChild(newContent)
  }

  let dom = new JSDOM("<!DOCTYPE html>"),
    document = dom.window.document
  const site = process.env.site
  const greetingDiv = document.createElement("div")

  //Greeting
  addElement("Hello,", greetingDiv, 'p')
  addElement(greeting, greetingDiv, 'p')
  document.body.append(greetingDiv)
  document.body.append(document.createElement("br"))

  //Project title
  const projectDiv = document.createElement("div")
  addElement("Projects", projectDiv, 'h2')
  if (projects.length === 0){
    //No projects text
    addElement(`No ${process.env.emailType} Projects`, projectDiv, 'p')
  }

  //Projects content
  projects.forEach((project) => {
    addElement(`Project Title: ${project.title}`, projectDiv, 'h4')
    if (project.mainContact.name !== undefined){
      addElement(`Contact Name: ${project.mainContact.name}`, projectDiv, 'p')
    }
    if (project.mainContact.email !== undefined){
      addElement(`Contact Email: ${project.mainContact.email}`, projectDiv, 'p')
    }
    const clickableProjectLink = `<a href=${site}/project/${project.slug}>${site}/project/${project.slug}</a>`
    addElement(`URL: ${clickableProjectLink}`, projectDiv, 'p')
    if (process.env.emailType === "Stale"){
      addElement(`Possible Problems: ${project.problems.join(" ")}`, projectDiv, 'p')
    }
    if (process.env.emailType === "New"){
      addElement(`Date Created: ${new Date(project.created).toString()}`, projectDiv, 'p')
    }
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
  let EMAIL_SMTP = "smtp://regmail.brown.edu:25"
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
  console.debug("Full info: \n", JSON.stringify(info))
}
