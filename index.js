const axios = require('axios')
require('dotenv').config()



async function fetchFilesFromRepo() {
  //will be passed into script
  const repoOwner = process.env.repoOwner
  //will be passed into script
  const repoName = process.env.repoName
  const folderPath = 'content/project'
  const accessToken = ''

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

      for (let i = 0; i < response.data.length; i++) {
        const file = response.data[i]
        const fileContent = fileContentArray[i]

        console.log(file.name)
        console.log("created: " + fileContent.created)
        console.log("endDate: " + fileContent.endDate)
        console.log("startDate: " + fileContent.startDate)
        console.log("status: " + fileContent.status)
        console.log("_______________")
      }
    } else {
      console.log('No files found in the folder.')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}


fetchFilesFromRepo().then(r => console.log("done!"))

