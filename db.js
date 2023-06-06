const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');



let client;
const quiz = 'quiz'
const users = 'users'
const prequiz ='prequiz'
const postquiz='postquiz'
async function connectDb() {
  if (client) {
    console.log('Using existing harsha client instance harsha');
    return{ client, quiz,users,prequiz,postquiz };
  } else {
    console.log("new harsha connection")
    client = new DynamoDBClient({
      region: "us-east-1"
      });

    // client = new DynamoDBClient({
    //   region: "us-east-1",
    //   credentials: {
    //     accessKeyId: "ASIARFTZFSZJQPNJVAHO",
    //     secretAccessKey: "skE6zSRjQ1A+E0RJFFt4nFIk3qyeFfdXtGH5hN3L",
    //     sessionToken: "FwoGZXIvYXdzEKH//////////wEaDDgmFrpVkLQKfh16CiLCAeMCc4JnFnpV7giCqRFqz17Y7gexwpIWQJ4wUXlyJxWn3PEvhxC47fd/rZM/I4OgbT1WnmcGeHggcTa75cSsnxABdW8bmLOoOIK6PN4vnM0kIXLefpcny6XgLmICd5sDjp4+/RaQnGaluo2IRglQw3B6NEY7PCGDxm7ZFXRsIWvJYPgAEV22zb0J2FrlO82JInHEjgBoYPgVBOuVPjzAp2Hn9Okd+GdEFXiTQNCBLCn1njdRu4Nmukrcp51pBZ9WhVNyKK24y6EGMi0ypQPsWNIfDbMw049qQg86t+7//45wvNElwq+XP9Y+r7BJG6YJZzYpThyoRec="
    //   }
    // });


    return { client, quiz,users,prequiz,postquiz };
  }
}


module.exports = { connectDb };

