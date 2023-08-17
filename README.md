# projectportal-email-service

Project Portal email service will run on the production internal cluster, `bkpi-ranch`.

A test version has also been set up on the qa internal cluster, `qbkpi-ranch`.

#### Access cluster

To access either cluster use the following command 
```kubectx bkpi-ranch``` or ```kubectx qbkpi-ranch```


#### Troubleshooting

If running either command results in the following error message `No resources found in tpl-projectportal namespace.` this means your cluster configuration has not been set or updated. Please refer [here](https://github.com/brown-ccv/k8s-deploy-bke#cluster-configuration) for further instructions. 

#### Check Namespace

Make sure you are in the `tpl-projectportal` namespace (in either cluster). Use `kubens` to see your current namespace and `kubens tpl-projectportal` to switch to the `tpl-projectportal` namespace.

#### Cronjobs
The Project Portal email service is a cronjob that will run on a schedule determined by the site partners and set in the configuration file, to check the cronjobs, use ```kubectl get cronjobs```

When a CronJob is created or updated, it calculates the next time it should run based on the schedule provided. The CronJob controller will create a new Job based on the schedule, and the Job will then create a corresponding Pod to execute the specified workload.

To check current jobs, use ```kubectl get jobs``` and to check current pods running, use ```kubectl get pods```




## Steps to deploying the projectportal-email-service on Kubernetes 


#### Creation of Docker image 
A Docker image is an executable package that includes everything needed to run the the email-service on Docker. It packages the application code, libraries and other dependencies into one single artifact. This repo includes a `Dockerfile` which will allow you to build this Docker image.



#### Build and Push Image to Registry `.github/workflows/build-docker.yml`
This action workflow automates the process of building and pushing the Docker image to a container registry. 
Building the image packages the image based on directions provided in the `Dockerfile`. The image is then uploaded by pushing it to a container registry, which is a repository for storing and managing Docker images. The registry we use is  `ghcr.io`

This workflow is triggered by multiple events, when there is a push to the `main` branch, when a pull request is opened targeting `main` as well as when a tag is created with the `v*.*.*` pattern. By combining push event and pull request triggers in the workflow, this helps uphold continuous integration, allowing us to detect issues early before code is merged and made official. 

Refer to https://github.com/thepolicylab-projectportals/projectportal-email-service/actions for examples of past triggered action workflows. 


#### Create a Kubernetes Deployment
This step takes place in the https://github.com/brown-ccv/k8s-deploy-bke repository. Please refer to `/tpl-projectportal`

A Kubernetes deployment is a way to define and manage the deployment of our email service within a Kubernetes cluster. To set up a Kubernetes deployment, we define a `cronjob.yml` configuration file that describes the type of application we are leveraging on Kubernetes. In this case, we are implementing a CronJob deployment, which is automatically scheduled to run every 10 minutes. The configuration file also specifies the specific version of the image we will use. 


#### Authentication with Secrets

A personal access token is required in two separate areas for the project portal email service. It is required to access and pull the container image which contains the email service deployed on Kubernetes. It is also required by the email service to gain access to the respective content repository in order to access the projects. 

Github offers the ***[fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)*** which allows you to set up select access to repositories, preventing one site's personal access token from access another site's content. 
When it comes to selecting the permissions for this access token, read-only access for **Contents** and **Metadata** (automatically selected when selecting Contents) will suffice. Once the token is generated, please store the token somewhere as you will need it later on. 

##### Regcred Secret
The GitHub Container Registry (GHCR), which has the namespace `https://ghcr.io`, stores container images within your organization or personal account, and allows you to associate an image with a repository. Although GHCR is a public container registry, it requires authentication to access and pull container images from it. This makes sure that only authorized users can access and interact with container images stored in GHCR. 

To authenticate your identity, we use a personal access token that we call `regcred `. 
```
 imagePullSecrets:
            - name: regcred
```

The code snippet above is from the cronjob.yml in `k8s-deploy-bke`. An image pull secret is used to authenticate a Kubeneretes cluster to pull images from a container registry, in our case: `ghcr.io`. The`regcred` secret is a Personal Access Token generated from Github that has `read`, `write`, and `delete` powers, currently generated by Josh Lu (@jashlu). 

Use the following command to create the regcred secret, using the fine-grained personal accesss token you generated previously.

```
kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=USERNAME --docker-password=PERSONAL_ACCESS_TOKEN
```
`kubectl create secret docker-registry` specifies the type of secret we want, which in this case, is of type `docker-registry`. This is because the credentials are used to authenticate with the Docker registry. This command will store the newly created `regcred` secret in the current context's namespace, in this case, `tpl-projectportal`. The secret is base64-encoded, ensuring no sensitive info is stored in plain text.  

##### Injected Secret
A personal access token is required to authenticate the email-service when it attempts to grab the content from the respective content repository. Refer to the tpl-projectportal folder in the [Brown Kubernetes Engine (BKE) Deployments repository](https://github.com/brown-ccv/k8s-deploy-bke)https://github.com/brown-ccv/k8s-deploy-bke and find the `/secrets` folder within tpl-projectportal.

We use the following simple format to encrpyt an env file that contains the personal access token which will be used by the email script. Refer to https://github.com/brown-ccv/k8s-deploy-bke/tree/feat-xnat-conjob-prod#handling-secrets for further instructions on how to encrypt and decrypt these secrets env files. 

