# speechtest
Test Spoken English Skills

## Live Demo
https://speechtest-dot-english-2020.appspot.com/

## Local Setup

### Install Go
https://golang.org/doc/install

### Install Google Cloud SDK for your platform
https://cloud.google.com/sdk/docs/quickstarts
Note : you can unzip it at any location, if you need to add the CLI untilioties in $PATH run following 
```
./google-cloud-sdk/install.sh
```

### Get the appengine go component 
```
gcloud components update
gcloud components install app-engine-go
```

### Get the code 
```
git clone https://github.com/neilghosh/speechtest.git
```

### Install the required Go depemndencies 
```
go get golang.org/x/net/context
go get google.golang.org/appengine
go get google.golang.org/api/iterator
```

### Run Developement Server
```
cd speechtest
<GOOGLE_CLOUD_SDK_PATH>/bin/dev_appserver.py go/speechtest/app.yaml
```

Note
 - If you get Go runtime related error, make sure your GOPATH is set
 - if you get any other dependencies missing you can install them too (I am working on automating them soon)
### Setting GOPATH
Install Go SDK at ```~/go``` directory 
```
export GOPATH=$HOME/go
```
## Deploy to appengine
gcloud app deploy go/speechtest

## Cloud Build Setup [For build pipiline ]

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
