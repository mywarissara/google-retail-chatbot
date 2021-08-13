# Building Chatbot Demo using Dialogflow
### Integrating with Line messaging application

**We have 2 folders:**
1. Fulfillment-function : The cloud function for receiving data from Dialogflow to upload on BigQuery, Cloud SQL
2. function : This cloud function is built for receiving data from Line application or other messagig application 

**Pre install dependencies:**
1. [`@google-cloud/vision`](https://www.npmjs.com/package/@google-cloud/vision)
2. [`@line/bot-sdk`](https://github.com/line/line-bot-sdk-nodejs)
3. `firebase`
4. [`google-cloud maps api`](https://pantheon.corp.google.com/google/maps-apis/overview)

## Tutorial

### 1. Dialogflow CX
Use pre agent data
1. Download the agent data from [Dialogflow CX Agent in Cloud Storage](https://storage.cloud.google.com/carpark-chatbot-bucket/Dialogflow-agent/Dialogflow-agent)

OR create new agent
1. Start creating agent on [Dialogflow CX Console](https://dialogflow.cloud.google.com/cx/projects)
2. Select **th** as a default language
3. Select location as **asia-northeast1 (Tokyo, Japan)**

    #### 1.1 Start creating a simple flow for parking reservation service
    - Click on the default start flow and create a route <br>
    - Create intent as `parking reservation` and add some traning phases : _"จองที่จอดรถ"_ , _"อยากจองที่จอด"_ 
    - set Parameter presets = "null"
    - Add transition to new page 
    - Create page name `parking info`
    - Add parameters name `tel` and `otp` to get the value from users. <br> You can identify fulfillment as you want.
    - The route of the page `parking info` set condition rules to be **Match AT LEAST ONE rule (OR)**
    - Set parameters to be `$page.params.status` operand `=` and value `FINAL`
    - Route to new page name `parking confirmation`
    - Set fulfillment to be Line fulfillment : 
 `{
  "type": "template",
  "altText": "this is a confirm template",
  "template": {
    "type": "confirm",
    "text": "ต้องการยืนยันการจองหรือไม่",
    "actions": [
      {
        "type": "message",
        "label": "ยืนยัน",
        "text": "ยืนยันการจอง"
      },
      {
        "type": "message",
        "text": "แก้ไข",
        "label": "แก้ไข"
      }
    ]
  }
}`

    - Route to new intent name `confirmation`, you can add training phases about _"ยืนยัน"_
    - Enable Webhook + new Webhook
    - Add display name and set timeout to be 30 sec
    - Web URL = <details><summary>**TRIGGER_URL_CLOUD_FUNCTION** </summary>
Will fill out later after we created the cloud function
</details>

### 2. BigQuery

- Select `project name`
- Create Dataset name `user_dataset`

- Create Table inside 
Table name : ***user_dataset***
Schema: 


| field name | type |
| ------ | ------ |
| user_id | String |
| user_name | String |
| user_surname | String |
| user_tel | String |
| user_license | String |


Table name : ***user_reserve***<br>
Schema: 


| field name | type |
| ------ | ------ |
| user_id | String |
| user_license | String |
| slot_id | String |


Table name : ***parking_slot***<br>
Schema: 


| field name | type |
| ------ | ------ |
| slot_id | String |
| slot_floor | String |
| slot_num | String |
| slot_status | Boolean |

**Please add some mockup data



### 3. Cloud Function

#### 3.1 Enable [API](https://pantheon.corp.google.com/apis)

- Select these APIs
    - Cloud Function API 
    - Cloud Monitoring API
    - Cloud Logging API
    - BigQuery API
    - BigQuery Storage API
    - Cloud Vision API 
    - Distance Matrix API
    - Dialogflow API
    - Cloud Source Repositories API
    - Cloud Build API

#### 3.2  Create [Cloud function](https://pantheon.corp.google.com/functions/) on GCP Console

- Create Function
- Function name :  ***fulfillment***
- HTTP trigger type : HTTP
- Click allow unauthenticated invocation
- Dropdown **Runtime,Build, and Connections Settings**
- Click on runtime, select **create new service acount**
- **Create service account** for Dialogflow Integration
- Click **NEXT**
- Copy this code and paste 
    - `~/fulfillment-function/index.js`
    - `~/fulfillment-function/package.json`

- Deploy

#### 3.3 TRIGGER_URL_CLOUD_FUNCTION

- After ~60sec of deployment, click on trigger to copy url
- Open Dialogflow Webhook page to paste the url



> #### Now your dialogflow should work well by testing in the test agent button 

#### 3.4 Vision API 
The Vision API is a pre-trained ML model that derives insights from images. It can get you multiple insights, including image labeling, face and landmark detection, optical character recognition, and tagging of explicit content. To learn more, see [Vision AI](https://cloud.google.com/vision/).


### 4. Line Developer

- Create Line Bot by [this tutorial ](https://medium.com/linedevth/%E0%B8%9B%E0%B8%90%E0%B8%A1%E0%B8%9A%E0%B8%97%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87-line-bot-b2cb90643901)

#### 4.1 Install Nodejs and npm
- `node --version` <br>
_It should show 
v14.17.3_

- `npm --version`<br>
_It should show 
v6.14.13_
#### 4.2 Install firebase CTL
- `npm install -g firebase-tools`
- `firebase --version`

#### 4.3 Initial Project
- `firebase login`
- Clone folder `~/function` to your directory

#### 4.4 Create Service Account Key 
- Go to [Service Account](https://pantheon.corp.google.com/projectselector2/iam-admin/serviceaccounts)
- Select service account and go to `KEYS`
- Add KEY
- Create New Key as **.JSON**
- Download and paste on your folder name it as `key.json`
- Copy it's path as `~/folder-name/key.json` 
- Go to your terminal and paste this with your path
`export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials-key.json`
- Go to `index.js`
    - Change parameters name
        - `$LINE_ACCESS_TOKEN`
        - `$DIALOGFLOW_URL`
        - `$MAP_API`
    - Line access token you can find from **Line developer console**
    - Dialogflow url, you can find on the dialogflow CX integration menu.<br>
        click on the Line Application integration and fill out the SECRET KEY, CHANNEL ACCESS TOKEN <br>
        and you will get the dialogflow webhook url.

**Cloud function emulator**
- `firebase emulators:start --only functions`
- Test by go to 
_http://localhost:5001/project-name/region/function-name_

You will see GET as a method
- Test by using tunnel [**ngrok**](https://ngrok.com/download)
- `./ngrok authtoken YOUR_AUTH_TOKEN`
    - YOUR_AUTH_TOKEN in ngrok account
- `./ngrok http 5000`
- Test by go to 
_https://ngrok_url/project-name/region/function-name_

You will see GET as a method
- Copy _https://ngrok_url/project-name/region/function-name_ and add it in Line Developer Console <br>
as **Webhook Settings URL**



**Deploy Cloud function**

- deploy code `firebase deploy --only functions`

