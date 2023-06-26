# projectportal-email-service

Project Portal email service will run on the production internal cluster, `bkpi-ranch`.

A test version has also been set up on the qa internal cluster, `qbkpi-ranch`.

To access either cluster use the following command 
```kubectx bkpi-ranch``` or ```kubectx qbkpi-ranch```

To check which namespace you are in, use ```kubens```, make sure you are in the `tpl-projectportal` namespace in either cluster.

The Project Portal email service is a cronjob that is scheduled to run every ... , to check the cronjobs, use ```kubectl get cronjobs```


When a CronJob is created or updated, it calculates the next time it should run based on the schedule provided. The CronJob controller will create a new Job based on the schedule, and the Job will then create a corresponding Pod to execute the specified workload.

To check current jobs, use ```kubectl get jobs``` and to check current pods running, use ```kubectl get pods```
