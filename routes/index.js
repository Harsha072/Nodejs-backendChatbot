
var router = require('express').Router();
const axios = require('axios');
const crypto = require('crypto');
const { someFunction } = require('../config');
const {connectDb} = require('../db')
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')

const {PutItemCommand,ScanCommand,GetItemCommand,UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

var runIntent = require("../controller/dialogFlow").runIntent;


function generateRandomId() {
  return crypto.randomBytes(16).toString('hex');
}

// const ssmClient = new SSMClient({ region: "us-east-1" });

try {


  console.log("inside try::::")

  router.post("/requestText", function (req, res) {
    (async () => {
      const [Dkey, Demail, id] = await someFunction();
      console.log("request body :: ", req.body)
     var result = await runIntent(id, req.body.requestText, req.body.name);
      
     console.log("the result", result)
     if(result.url){
      return res.send(
        {
          "id": result.id,
          "responseMessage": result.Response,
          "originalQuery": result.Query,
          "intent": result.Intent,
          "url":result.url
        });
     }
      return res.send(
        {
          "id": result.id,
          "responseMessage": result.Response,
          "originalQuery": result.Query,
          "intent": result.Intent
        });

    })()



  }


  );

  router.get('/quiz', async (req, res) => {
    try {
      const response = await axios.get('https://the-trivia-api.com/api/questions?categories=history,science,geography,sport_and_leisure&limit=5&region=IN&difficulty=hard');
      console.log(response)
      const quizClient =await connectDb()
      console.log("client:::: ",quizClient);
   
      const quiz = response.data
      console.log(quiz)
      res.send(quiz[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to retrieve data from API' });
    }
  });

  router.get('/quiz-question/:id', async (req, res) => {
    try {
      console.log(" get question based on id")
      const id = req.params.id;
      console.log("number ",id)
      const { client, quiz } = await connectDb();
      const params1 = {
        TableName: quiz
      };
      const data = await client.send(new ScanCommand(params1));
      console.log("got all questions in questions id", data.Items)
      const params = {
        TableName:quiz ,
        Key: {
          'id': { N: id }
        }
      };
      try {
      
       console.log("id", typeof data.Items.length)
       const num = parseInt(id)
       console.log("type of num::: ",typeof num)
       console.log("length",data.Items.length)
        if(num<=data.Items.length){
          console.log("in if:::")
          const command = new GetItemCommand(params);
          const data = await client.send(command);
          console.log("got the question based on id in question id",data.Item)
         return res.status(200).json(data.Item);
        }
        else{
          console.log("in else:::")
         return res.send({message:'end'})
        }
      
      } catch (err) {
        console.error(err);
      return  res.json({ message: 'Server error' });
      }
    
     
     
    } catch (error) {
      console.error(error);
     return res.status(500).send({ error: 'Failed to retrieve data from API' });
    }
  });

  router.get('/quiz-question', async (req, res) => {
    try {
      console.log(" length of questions")
      const { client, quiz } = await connectDb();
      const params = {
        TableName: quiz
      };
    
      try {
        const data = await client.send(new ScanCommand(params));
        console.log(" got all questions length", data.Items.length)
        
         res.send({length:data.Items.length});
      } catch (err) {
        console.error(err);
      }
     
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to retrieve data from API' });
    }
  });


  router.post('/login', async (req, res) => {
    const newUser = req.body
   console.log("backend data ",newUser)
   const { client,users } = await connectDb();

const params ={
  TableName: users,
  Key: {
    'email': {S:req.body.email} // Replace 'user@example.com' with the actual email value
  }
}
  
const presentUser = await client.send(new GetItemCommand(params))
  console.log("got it:: ",presentUser.Item)
  
  if(presentUser.Item){
    console.log("if part::::")
    console.log(typeof presentUser.Item.totalLogin.N)
    console.log(parseInt(presentUser.Item.totalLogin.N)+1);
   presentUser.Item.totalLogin.N = parseInt(presentUser.Item.totalLogin.N)+1
   presentUser.Item.loginTime.S = newUser.loginTime
    console.log("updated",presentUser.Item.totalLogin.N)
    console.log("updated time",presentUser.Item.loginTime.S)  
   try {
       
    const params = {
      TableName: users,
      Key: { "email": { S: presentUser.Item.email.S } },
      UpdateExpression: "SET #attrName = :attrValue, #attrTime = :attrValueTime",
      ExpressionAttributeNames: { "#attrName": "totalLogin", "#attrTime":"loginTime" },
      ExpressionAttributeValues: { ":attrValue": { N: presentUser.Item.totalLogin.N.toString() },
                                    ":attrValueTime":{S:presentUser.Item.loginTime.S} },
      ReturnValues: "ALL_NEW"
    };
    const data = await client.send(new UpdateItemCommand(params));
    console.log("Item updated:", data);
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
    console.log("hi ",err)
  }
}
  else{
    console.log("else part::::: ")
 const params = {
    TableName: users,
    Item: {
      'email': {S: newUser.email},
      'id':{S:generateRandomId().toString()},
      'username': {S: newUser.username},
      'loginTime': {S: newUser.loginTime},
      'totalLogin': {N: newUser.totalLogin.toString()},
      'sessionDuration': {S: newUser.sessionDuration}
    }
  }
  try {
       
    const data = await client.send(new PutItemCommand(params));
    console.log("Item inserted successfully to users:", data);
    res.status(200).send(data.Item);

  } catch (err) {
    res.status(500).send(err);
    console.error("Error inserting item in users:", err);
  }
  }
  
  });

  router.post('/logout', async (req, res) => {
    const { client,users } = await connectDb();

    const params ={
      TableName: users,
      Key: {
        'email': {S:req.body.email} // Replace 'user@example.com' with the actual email value
      }
    }
      
    const presentUser = await client.send(new GetItemCommand(params))
      console.log("got it:: ",presentUser.Item)
      
      if(presentUser.Item){
       
       presentUser.Item.sessionDuration.S = req.body.sessionDuration
        console.log("updated",presentUser.Item.sessionDuration.S)
             try {
           
        const params = {
          TableName: users,
          Key: { "email": { S: presentUser.Item.email.S } },
          UpdateExpression: "SET #attrName = :attrValue",
          ExpressionAttributeNames: { "#attrName": "sessionDuration"},
          ExpressionAttributeValues: { ":attrValue": { S: presentUser.Item.sessionDuration.S } },
          ReturnValues: "ALL_NEW"
        };
        const data = await client.send(new UpdateItemCommand(params));
        console.log("Item updated: session ", data);
        res.status(200).send(data);
      } catch (err) {
        res.status(500).send(err);
        console.log("hi ",err)
      }
    }
  });
  
  router.post('/prequiz', async (req, res) => {
    console.log("reqest body prequiz",req.body)
    const { client,users,prequiz } = await connectDb();

    const params ={
      TableName: users,
      Key: {
        'email': {S:req.body.email} // Replace 'user@example.com' with the actual email value
      }
    }
      
    const presentUser = await client.send(new GetItemCommand(params))
      console.log("got it in prequiz:: ",presentUser.Item, prequiz)
      
      if(presentUser.Item){
       
        const params = {
          TableName: prequiz,
          Item: {
            'email': {S: req.body.email},
            'id':{S:generateRandomId().toString()},
            'score': {N: req.body.score.toString()},
            'totalTimeTaken': {S: req.body.totalTimeTaken},
            'timeStamp': {S: req.body.timeStamp}
          }
        }
        try {
             
          const data = await client.send(new PutItemCommand(params));
          console.log("Item inserted successfully to prequiz:", data);
          res.status(200).send(data.Item);
      
        } catch (err) {
          res.status(500).send(err);
          console.error("Error inserting item in prequiz:", err);
        }
    }
  });

  router.get('/user', async (req, res) => {
   
})


  router.post('/create', async (req, res) => {
   
    try {
      const data = req.body
     console.log("body",data.id)
     const item = {
      id: { N: data.id.toString() },
      question: { S: data.question },
      options: {
        L: data.options.map((option) => {
          return { S: option };
        }),
      },
      answer: { S: data.answer },
    };
    
      console.log("item:::: ",item)
      // create a PutItem command to insert the item into the table
      const { client, quiz } = await connectDb();
      const params = {
        TableName: quiz,
        Item: item,
      };
      
      // execute the PutItem command
      try {
       
        const data = await client.send(new PutItemCommand(params));
        console.log("Item inserted successfully:", data);
      } catch (err) {
        console.error("Error inserting item:", err);
      }
  
 
   
     
    } catch (error) {
      console.error(error);
    
    }
  });


}
catch (error) {
   console.log("entire ",error)
}


module.exports = router;