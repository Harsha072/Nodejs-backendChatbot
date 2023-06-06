const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const forge = require('node-forge');
const { someFunction } = require('../config');

require('dotenv').config()

const sessionId = uuid.v4();
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runIntent(projectId, requestText,event) {
    const [Dkey, Demail]= await someFunction()

var newKey = Dkey.replace(/\\n/g, '\n').trim()
console.log("the key",newKey)

try{

    let config = {
        credentials: {
            private_key:newKey,
            client_email: Demail
        }
    }
    
    const sessionClient = new dialogflow.SessionsClient(config);
    
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );
    

const intentRequest = {
    session: sessionPath,
    queryInput: {
    text: {
        // The query to send to the dialogflow agent
        text: requestText,
        // The language used by the client (en-US)
        languageCode: 'en-US',
    },
    },
};

const intentRequestIntro = {
    session: sessionPath,
    queryInput: {
        event:{
         name:event,
         languageCode: 'en-US',
        },
    text: {
        // The query to send to the dialogflow agent
        text: requestText,
        // The language used by the client (en-US)
        languageCode: 'en-US',
    },
    },
};

// // The text query request.
// // Send request and log result

if(event){
   
    const responses = await sessionClient.detectIntent(intentRequestIntro);
  
console.log(responses[0].queryResult.fulfillmentMessages[0].payload)
const result = responses[0].queryResult;
console.log(responses[0].responseId)
return await {
        
    "id":responses[0].responseId,
    "Query": result.queryText,
    "Response": result.fulfillmentText,
    "Intent": result.intent.displayName
};
}
else{
   
    const responses = await sessionClient.detectIntent(intentRequest);
 
    console.log("responses ::::: ",responses[0].queryResult)
    const fulfillmentMessages = responses[0].queryResult.fulfillmentMessages;
    const result = responses[0].queryResult;
    console.log(responses[0].responseId)
    console.log("fulll ",fulfillmentMessages)
// Find the first message with a custom payload
const customPayloadMessage = fulfillmentMessages.find(message => message.payload);

if (customPayloadMessage) {
  // Extract the custom payload from the message
  const customPayload = customPayloadMessage.payload;
console.log("got custome payload ",customPayload.fields)


// Extract the URL of the GIF from the custom payload
const gifUrl = customPayload.fields.payload.structValue;
const gifFields = gifUrl.fields
const struct = gifFields.gif
const fild = struct.structValue
const url =fild.fields.url
return await {
        
    "id":responses[0].responseId,
    "Query": result.queryText,
    "Response": result.fulfillmentText,
    "Intent": result.intent.displayName,
    "url":url.stringValue
};

}
else{

    return await {
        
        "id":responses[0].responseId,
        "Query": result.queryText,
        "Response": result.fulfillmentText,
        "Intent": result.intent.displayName,
        "status":result.intent.endInteraction
    };
}
   
    
}

}
catch(error){
    console.log("the error",error)

}



}

module.exports.runIntent = runIntent;

