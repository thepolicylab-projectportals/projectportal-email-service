const axios = require('axios')
require('dotenv').config()


export async function runEmailService() {

  const repoOwner = process.env.repoOwner
  const repoName = process.env.repoName
  const accessToken = process.env.PAT
  //iterate through TPL site, curl site for data and return array of all projects
  const projects = await fetchFilesFromRepo(repoOwner, repoName, accessToken)

  //identify stale projects, create html body of email

  //send out newly constructed email from previous step to designated contact
  const emails = await fetchEmailsFromRepo(repoOwner, repoName, accessToken)
}


async function fetchEmailsFromRepo(repoOwner, repoName, accessToken) {

  const getEmailsPath = 'content/config/email-service-contacts.json'
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`

  try {

    const emailsUrl = `${apiUrl}/${getEmailsPath}?ref=add-example-projects&media=raw`
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

    const projectsUrl = `${apiUrl}/${getProjectsPath}?ref=add-example-projects&media=raw`
    const contactsUrl = `${apiUrl}/${getContactsPath}?ref=add-example-projects&media=raw`

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


