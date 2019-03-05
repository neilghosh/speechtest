# speechtest
Test Spoken English 

## Live Demo
https://speechtest-dot-english-2020.appspot.com/

## Run Developement Server
```
cd speechtest
dev_appserver.py go/speechtest/app.yaml
```

Note - If you get Go runtime related error, make sure your GOPATH is set
### Setting GOPATH
Install Go SDK at ```~/go``` directory 
```
export GOPATH=$HOME/go
```
## Deploy to appengine
gcloud app deploy go/speechtest

## Cloud Build Setup

Find the appengine project id 
```
NUM=$(gcloud projects describe $PROJECT \
--format="value(projectNumber)") && echo ${NUM}
```

Enable Appengine API and Add IAM Roles

```
 gcloud projects add-iam-policy-binding ${PROJECT} \
  --member=serviceAccount:${NUM}@cloudbuild.gserviceaccount.com \
  --role=roles/appengine.deployer

 gcloud projects add-iam-policy-binding ${PROJECT} \
  --member=serviceAccount:${NUM}@cloudbuild.gserviceaccount.com \
  --role=roles/appengine.serviceAdmin

```

Submit the build or trigger it from cloud build console or checkin any file in any branch
```
gcloud builds submit --config cloudbuild.yaml . --substitutions=_NOPROMOTE="--no-promote"
```