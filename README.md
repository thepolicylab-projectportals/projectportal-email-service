# projectportal-email-service

Project Portal email service will run on the production internal cluster, `bkpi-ranch`.

A test version has also been set up on the qa internal cluster, `qbkpi-ranch`.

#### Access cluster

To access either cluster use the following command 
```kubectx bkpi-ranch``` or ```kubectx qbkpi-ranch```


#### Troubleshooting

If running either command results in the following error message `No resources found in tpl-projectportal namespace.` this means your cluster configuration has not been set or updated. Please refer [here](https://github.com/brown-ccv/k8s-deploy-bke#cluster-configuration) for further instructions. 

#### Check Namespace

To check which namespace you are in, use ```kubens```, make sure you are in the `tpl-projectportal` namespace in either cluster.

#### Cronjobs
The Project Portal email service is a cronjob that is scheduled to run every ... , to check the cronjobs, use ```kubectl get cronjobs```

When a CronJob is created or updated, it calculates the next time it should run based on the schedule provided. The CronJob controller will create a new Job based on the schedule, and the Job will then create a corresponding Pod to execute the specified workload.

To check current jobs, use ```kubectl get jobs``` and to check current pods running, use ```kubectl get pods```
