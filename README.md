# projectportal-email-service

## Kubernetes Basics
#### Kubens

`kubens` allows you to easily switch between Kubernetes namespaces. A simple `kubens foo` will make `foo` your active namespace.


#### Cronjobs
The Project Portal email service is a `cronjob` that runs on a pre-determined schedule. 

To check all cronjobs, use ```kubectl get cronjobs```

When a CronJob is created or updated, it calculates the next time it should run based on the schedule provided. The CronJob controller will create a new Job based on the schedule, and the Job will then create a corresponding Pod to execute the specified workload.

To check current jobs, use ```kubectl get jobs``` and to check current pods running, use ```kubectl get pods```




## Steps to deploying the projectportal-email-service on Kubernetes 


### Creation of Docker image 
A Docker image is an executable package that includes everything needed to run the email service on Docker.

The Docker image is created from a Dockerfile, a human-readable text file similar to a configuration file. The Dockerfile contains all the instructions to build the image. You have to place the Dockerfile along with all associated libraries and dependencies in a folder to build the image. Check out the [Dockerfile](./Dockerfile) of this project for details.


### Build and Push Image to Registry `.github/workflows/build-docker.yml`
This action workflow automates the process of building and pushing the Docker image to a container registry (which has to be done everytime you want to initialize a new Docker image or update an existing one). 

Building the image packages the image based on directions provided in the `Dockerfile`. The image is then uploaded by pushing it to a container registry, which is a repository for storing and managing Docker images. The Brown CCV team previously relied on the `ghcr.io` registry.

This workflow is specifically configured to trigger in the following scenarios:
1. When there is a push to the `main` branch
2. When a pull request is opened targeting `main` 
3. When a tag is created with the `v*.*.*` pattern. 

By combining push event and pull request triggers in the workflow, this helps uphold continuous integration, allowing us to detect issues early before code is merged and made official. 


### Create a Kubernetes Deployment

A Kubernetes deployment is a way to define and manage the deployment of our email service within a Kubernetes cluster. To set up a Kubernetes deployment, we define a `cronjob.yml` configuration file that describes the type of application we are leveraging on Kubernetes. In this case, we are implementing a CronJob deployment, which is automatically scheduled to run every 10 minutes. The configuration file also specifies the specific version of the image we will use. 


### Authentication with Regcred and other secrets 

Depending on the chosen registry for storing your Docker images, authentication might be necessary. 

The following will outline the steps taken by the Brown CCV team to configure authentication given their approach of using the ghcr registry.

The GitHub Container Registry (GHCR), which has the namespace `https://ghcr.io`, stores container images within your organization or personal account, and allows you to associate an image with a repository. Although GHCR is a public container registry, it requires authentication to access and pull container images from it. This makes sure that only authorized users can access and interact with container images stored in GHCR. 

To authenticate your identity, we use a personal access token that we call `regcred `. 
```
 imagePullSecrets:
            - name: regcred
```

The code snippet above is from the cronjob.yml that would be defined to manage the deployment of our email service. An image pull secret is used to authenticate a Kubernetes cluster to pull images from a container registry, in our case: `ghcr.io`. The content of the `regcred` secret is a Personal Access Token that would be generated by a qualified developer, with `read`, `write`, and `delete` powers.

The following command was used to create the regcred secret 

```
kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=USERNAME --docker-password=PERSONAL_ACCESS_TOKEN
```
`kubectl create secret docker-registry` specifies the type of secret we want, which in this case, is of type `docker-registry`. This is because the credentials are used to authenticate with the Docker registry. This command will store the newly created `regcred` secret in the current context's namespace. Refer to the top of this README for information on how to determine what namespace you are in. The secret is base64-encoded, ensuring no sensitive info is stored in plain text.  
