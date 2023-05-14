const express = require("express");
const admin = require("firebase-admin");
const twilio = require("twilio");
const router= express.Router()
const serverless = require('serverless-http')

// Initialize Firebase Admin SDK
var serviceAccount = require("./links-7f59e-firebase-adminsdk-2s5t7-edcdb0b355.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://links-7f59e.firebaseio.com",
});
// Initialize Express app
const app = express();

router.get("/get", (req, res) => {
  // Get a reference to the Firebase Auth client SDK
  const auth = admin.auth();

  // Get the user's email and password from a form or input fields
  const email = "user@example.com";
  const password = "password123";
  const user = {
    email: "user@example.com",
    password: "password123",
    displayName: "John Doe",
    photoURL: "https://example.com/profile.jpg",
  };
  auth
    .createUser(user)
    .then((userRecord) => {
      console.log("Successfully created new user:", userRecord.toJSON());
    })
    .catch((error) => {
      console.error("Error creating new user:", error);
    });
});

// Define an API endpoint to send SMS messages
router
  .post("/send-sms", async (req, res) => {
    // Get a reference to the Firebase Auth users collection
    // const usersRef = admin.firestore().collection('users');
    const usersRef = await admin.auth().listUsers();

    // Get a reference to the Twilio client using your Account SID and Auth Token
    const twilioClient = twilio(
      "ACbd0cd57ffc3b7bfe29a5769a20ec6c76",
      "c40aa88ed839f121d47cc29964dbb5c6"
    );

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
app.use('/api',router)
// Start the Express server
// app.listen(3000, () => {
//   console.log("Server started on port 3000");
// });
module.exports = app
module.exports.handler = serverless(app)