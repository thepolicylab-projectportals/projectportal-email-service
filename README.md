# projectportal-email-service

Project Portal email service will run on the production internal cluster, `bkpi-ranch`.

A test version has also been set up on the qa internal cluster, `qbkpi-ranch`.

#### Access cluster

To access either cluster use the following command 
```kubectx bkpi-ranch``` or ```kubectx qbkpi-ranch```


##### Troubleshooting

If running either command results in the following error message `No resources found in tpl-projectportal namespace`, this means your cluster configuration has not been set or updated. Please refer [here](https://github.com/brown-ccv/k8s-deploy-bke#cluster-configuration) for further instructions. 

#### Check Namespace

After you are in the desired cluster, make sure you are in the `tpl-projectportal` namespace. Use `kubens` to see your current namespace and `kubens tpl-projectportal` to switch to the `tpl-projectportal` namespace.

#### Cronjobs
The Project Portal email service is a cronjob that will run on a schedule determined by the site partners and set in the configuration file. To check the currently deployed cronjobs, use ```kubectl get cronjobs```. To display further information about each cronjob, including what image each cronjob is running, use ```kubectl get cronjobs -o wide```

When a CronJob is created or updated, it calculates the next time it should run based on the schedule provided. The CronJob controller will create a new Job based on the schedule, and the Job will then create a corresponding Pod to execute the specified workload.

To check current pods running and previously run pods, use ```kubectl get pods```




## Steps to deploying the projectportal-email-service on Kubernetes 


### Creation of Docker image 
A Docker image is an executable package that includes everything needed to run the the email-service on Docker. It packages the application code, libraries and other dependencies into one single artifact. This repo includes a `Dockerfile` which will allow you to build the email service into a Docker image.



### Build and Push Image to Registry `.github/workflows/build-docker.yml`
This action workflow automates the process of building and pushing the Docker image to a container registry. 
Building the image packages the image based on directions provided in the `Dockerfile`. The image is then uploaded by pushing it to a container registry, which is a repository for storing and managing Docker images. The registry we use is `ghcr.io`

This workflow is triggered in multiple different scenarios:
1. When a pull request is opened that targets merging into the `main` branch
2. When a pull request is merged into the `main` branch
3. When a release tag is created with the `v*.*.*` pattern

By combining push event and pull request triggers in the workflow, this helps uphold continuous integration, allowing us to detect issues early before code is merged and made official. 

Refer to https://github.com/thepolicylab-projectportals/projectportal-email-service/actions for examples of past triggered action workflows. 


### Create a Kubernetes Deployment
This step takes place in the https://github.com/brown-ccv/k8s-deploy-bke repository. Please refer to the `/tpl-projectportal` subfolder.

A Kubernetes deployment is a way to define and manage the deployment of our email service within a Kubernetes cluster. To set up a Kubernetes deployment, we define a `<SITE>-<EMAIL_SERVICE_TYPE>-cronjob.yml` configuration file that describes the type of application we are leveraging on Kubernetes. In this case, we are implementing a CronJob, which is automatically scheduled to run every day at 12:00. The configuration file also specifies the specific version of the image we will use. Refer to any of the pre-existing cronjob.yml files for a template on creating a new one. 


#### Authentication with Secrets

A personal access token is required for the Kubernetes Deployment. It is required to access and pull the container image, which contains the email service deployed on Kubernetes. It is also required by the email service to gain access to the respective content repository in order to access the projects. 

Github offers the ***[fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)*** which allows you to set up select access to repositories. 
When it comes to selecting the permissions for this access token, read-only access for **Contents** and **Metadata** (automatically selected when selecting Contents) will suffice. Once the token is generated, please store the token somewhere as you will need it later on. 

##### 1. Regcred Secret
The GitHub Container Registry (GHCR), which has the namespace `https://ghcr.io`, stores container images within your organization or personal account, and allows you to associate an image with a repository. Although GHCR is a public container registry, it requires authentication to access and pull container images from it. This makes sure that only authorized users can access and interact with container images stored in GHCR. 

To authenticate your identity, we use a personal access token that we call `regcred `. 
```
 imagePullSecrets:
            - name: regcred
```

The code snippet above is from each cronjob.yml file in `k8s-deploy-bke`. An image pull secret is used to authenticate a Kubeneretes cluster to pull images from a container registry, in our case: `ghcr.io`. This `regcred` secret is a [fine-grained Personal Access Token](https://github.com/settings/tokens?type=beta) generated by the CCV CJ bot that has `read` access for **content** and **metadata**, and repository access for all project portal related content repositories and the projectportal-email-service repository.

Use the following command to create the regcred secret, using the fine-grained personal accesss token you generated previously.

```
kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=USERNAME --docker-password=PERSONAL_ACCESS_TOKEN
```

`kubectl create secret docker-registry` specifies the type of secret we want, which in this case, is of type `docker-registry`. This is because the credentials are used to authenticate with the Docker registry. This command will store the newly created `regcred` secret in the current context's namespace, in this case, `tpl-projectportal`. The secret is base64-encoded, ensuring no sensitive info is stored in plain text.

###### Maintaining Regcred Secret
The Personal Access Token is set up to expire after a specific period of time, requiring manual renewal by CCV personnel with access to the CCV CJ Bot. 

You can use the command `kubectl get secrets` to view all secrets associated with the tpl-projectportal. 
In order to update the expiring secret, you must first delete the existing secret by using `kubectl delete secret <SECRET_NAME>` and then use the `kubectl create secret ...` command from above to generate a new replacement secret. 



##### 2. Injected Env Secret
A personal access token is also required to authenticate the email-service when it uses the Github API to grab the content from the respective content repository. Refer to the tpl-projectportal folder in the [Brown Kubernetes Engine (BKE) Deployments repository](https://github.com/brown-ccv/k8s-deploy-bke) and find the `/secrets` folder within the tpl-projectportal subfolder. The personal access token used is also the same fine-grained personal access token generated to create the Regcred secret. Please use the same secret in this case. 

We use the following simple format to encrypt an env file that contains the personal access token which will be used by the email script. Refer to https://github.com/brown-ccv/k8s-deploy-bke/tree/feat-xnat-conjob-prod#handling-secrets for further instructions on how to set up SOPs encryption credentials and the commands required to encrypt and decrypt these secrets env files. 

###### Kustomization.yaml
The kustomization.yaml file is a tool for customizaing Kubernetes manifests. In our case, we use it to manage and apply the inject env secret that you have generated. 

```
resources:
  - example-content-stale-cronjob.yml
  - example-content-new-cronjob.yml
  - nc-new-cronjob.yml
  - nc-stale-cronjob.yml
  - satx-new-cronjob.yml
  - satx-stale-cronjob.yml
```
This code excerpt is from the Kustomiation.yaml in tpl-projectportal. The `resources` section specifies the Kubernetes resources that we want to be "customized" by this Kustomization file. In other words the secrets we generate from the encrypted secret.env files will be applied to the resources that we list here. 
```
secretGenerator:
  - name: env
    envs:
      - secrets/secrets.env
  - name: nc-env
    envs:
      - secrets/nc-secrets.env
  - name: satx-env
    envs:
      - secrets/satx-secrets.env
```
This section defines secret generators, which are used to create Kubernetes secrets from enviornment variable files found in the `/secrets` folder.
It is important to identify each secret has a specific name: `env`, `nc-env`, `satx-env` as this identifies which secret will be used by which email-service. 

### Deploying the email-service
This [script](https://github.com/brown-ccv/k8s-deploy-bke/blob/main/deploy.sh) helps to automate the deploy process of the email-service. Simply run `./deploy.sh` and the script will run through a wizard to help you deploy the right service in the right cluster. 
