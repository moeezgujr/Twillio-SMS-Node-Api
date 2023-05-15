const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const admin = require("firebase-admin");
const twilio = require("twilio");
const cors = require('cors');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors());
// const client = require('twilio')(accountSid, authToken);

let records = [];


var serviceAccount = require("../links-7f59e-firebase-adminsdk-2s5t7-edcdb0b355.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://links-7f59e.firebaseio.com",
});
//Get all students
router.get('/', (req, res) => {
  res.send('App is running..');
});
    // Get a reference to the Twilio client using your Account SID and Auth Token
    const twilioClient = twilio(
      "ACbd0cd57ffc3b7bfe29a5769a20ec6c76",
      "80879a139dfe99207db7989e79bdaa26"
    );
//Create new record
router.post('/add', (req, res) => {
  twilioClient.validationRequests
  .create({friendlyName: 'My Home Phone Number', phoneNumber: req.body.phoneNumber})
  .then(validation_request =>  res.send('New record addedd.',validation_request));
res.status (200).send ({body:req.body,msg:'nee'});

});
router
  .get("/send-sms", async (req, res) => {
    // Get a reference to the Firebase Auth users collection
    // const usersRef = admin.firestore().collection('users');
    const usersRef = await admin.auth().listUsers();



    // Define the message to send
    const message = "Hello from Twilio!";
    console.log(usersRef);
    res.status(200).send(usersRef);
    const promises = [];

    usersRef.users.forEach((userRecord) => {
      const phoneNumber = userRecord.toJSON().phoneNumber;
      console.log(phoneNumber);
      const promise = twilioClient.messages
        .create({
          body: message,
          from: "+12705145302",
          to: phoneNumber,
        })
        .then((message) => {
          console.log(
            `Message sent to ${phoneNumber} with message ID ${message.sid}`
          );
        })
        .catch((error) => {
          console.error(`Error sending message to ${phoneNumber}: ${error}`);
        });
      promises.push(promise);
    });

    Promise.all(promises)
      .then(() => {
        res.status(200).send("SMS messages sent successfully");
      })
      .catch((error) => {
        console.error(`Error sending SMS messages: ${error}`);
        res.status(500).send("Error sending SMS messages");
      });
  })
//delete existing record
router.delete('/', (req, res) => {
  res.send('Deleted existing record');
});

//updating existing record
router.put('/', (req, res) => {
  res.send('Updating existing record');
});

//showing demo records
router.get('/demo', (req, res) => {
  res.json([
    {
      id: '001',
      name: 'Smith',
      email: 'smith@gmail.com',
    },
    {
      id: '002',
      name: 'Sam',
      email: 'sam@gmail.com',
    },
    {
      id: '003',
      name: 'lily',
      email: 'lily@gmail.com',
    },
  ]);
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
