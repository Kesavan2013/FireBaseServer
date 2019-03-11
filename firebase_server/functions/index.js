const functions = require('firebase-functions');
const firebase1 = require("firebase");
const admin = require('firebase-admin'); // for accessing the realtime database

var firebaseConfig = require('./firebase.config.json');
admin.initializeApp(functions.config().firebase); // initialize the Firebase Admin SDK
firebase1.initializeApp(firebaseConfig);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.SampleNotification =  functions.https.onRequest((request, response) => {
	
	if (request.method == 'POST') {
		var notification_data = {};
					notification_data = {
                        payload: {
                            title: 'BikePooling',
                            body: 'Your rider is available'
                        },
                        device_token: "eHkEJqE8jlA:APA91bHMZ5CVUa28LLn7AzpoOvGPABS4iIrPjKyBr-OTCDKUfTmoDYcwggBdbQLF0AVctKkaPciYnnWJb_KiIwWHc1FojMH0MsJcSHghiK_yXh4uA7KRrolthweM3aYn1FzSkLNN1Yi2"
                    };
                    has_notification = true;
					
					var payload = {
                     notification: notification_data.payload
                   };
                    
                   // send push notification
                   admin.messaging().sendToDevice(notification_data.device_token, payload).then(function(res) {
                        
                       response.send(JSON.stringify({'has_notification': true})); // inform the app that a notification was sent
                   })
                   .catch(function(error) {
                       response.send(JSON.stringify(error)); // send the push notification error to the app
                   });
      
	}
});




exports.registerDeviceToken = functions.https.onRequest((request, response) => {
	
	
	var email =  request.body.email;
	var password = request.body.password;
	
	if(request.method == 'POST')
	{		
		firebase1.auth().createUserWithEmailAndPassword(email, password).then((user) => {		
			var uniqueID = user.user.uid;			
			
			var userid = request.body.userId;
			var deviceToken = request.body.deviceToken;
			var username = request.body.username;
			var email = request.body.email;
			var userType = request.body.userType;
			var bikeType = request.body.bikeType;			
			
			
			admin.database().ref('/users').push({
			 userid: userid,
			 username : username,
			 email : email,
			 deviceToken: deviceToken,
			 userType : userType,
			 bikeType : bikeType
			});
			
			response.send("user inserted successfully" + uniqueID);
			
		}).catch((err) => {
			response.writeHead(500, { "Content-Type": "application/json" });
			response.end(JSON.stringify({ error: err }));
		});
	}
});

exports.getDeviceToken = functions.https.onRequest((request, response) => {
	
	if(request.method == 'POST')
	{
		try{
			var id = request.body.userid;
			//var id = "6Xhv0tRBkbWp6K3Qr6hgg9Cd36R2";
			 var ref = admin.database().ref("users");

			ref.on("value", function(snapshot) {
			 snapshot.forEach(function(childSnapshot) {
				  var childData = childSnapshot.val();		  
				  if(childData.userid == id)
				  {
					//response.send("childData :" + childData.deviceToken);
					
					var notification_data = {};
					notification_data = {
                        payload: {
                            title: 'BikePooling',
                            body: 'Your rider is available'
                        },
                        device_token: childData.deviceToken
                    };
                    has_notification = true;
					
					var payload = {
                     notification: notification_data.payload
                   };
                    
                   // send push notification
                   admin.messaging().sendToDevice(notification_data.device_token, payload).then(function(res) {
                        
                       response.send(JSON.stringify({'has_notification': true})); // inform the app that a notification was sent
                   })
                   .catch(function(error) {
                       response.send(JSON.stringify(error)); // send the push notification error to the app
                   });
					
				  }					
				});
			});
		}
		catch(e){
			response.send("error : " + e); // send the push notification error to the app
		}
	}
	
});

    exports.init_push = functions.https.onRequest((request, response) => {
		if (request.method == 'POST') {
				
				var id = request.body.id;
				var ref = admin.database().ref("users");

			ref.on("value", function(snapshot) {
				
			 snapshot.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();		  
				if(childData.userid == id)
				{
					try{
						
						response.send(JSON.stringify({'has_notification': childData})); // inform the app that a notification was sent
					}
					catch(e){
						response.send(JSON.stringify(error)); // send the push notification error to the app
					}
				}

				})
			});
		}
	});