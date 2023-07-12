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
The Project Portal email service is a cronjob that is scheduled to run every ... , to check the cronjobs, use ```kubectl get cronjobs```

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

##### Regcred and other secrets 

```
 imagePullSecrets:
            - name: regcred
```
Referencing a code snippet from cronjob.yml, the `regcred` secret is used as an image pull secret. An image pull secret is used to authenticate a Kubeneretes cluster to pull images from a container registry, in our case: `ghcr.io`



