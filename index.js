const axios = require('axios')
require('dotenv').config()



async function fetchFilesFromRepo() {
  //will be passed into script
  const repoOwner = process.env.repoOwner
  //const repoOwner = 'thepolicylab-projectportals'

  //will be passed into script
  const repoName = process.env.repoName
  //const repoName = 'example-content'

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


fetchFilesFromRepo().then(r => console.log("done!"))

