const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uo4fp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('wagon');
        const carsCollection = database.collection('cars');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');


        app.get('/cars', async(req,res)=>{
          const allData = carsCollection.find({});
          const cars = await allData.toArray();
          // console.log(cars)
          res.send(cars);
      })

      app.get('/cars/:id', async(req,res)=> {
        const id = req.params.id;
        // console.log(id)
        const query = {_id: objectId(id)};
        const car = await carsCollection.findOne(query);
        res.json(car);

    })
    
    app.get('/orders', async(req,res) => {
      const email = req.query.email;
      const query = {email: email}
      const allData = ordersCollection.find(query)
      const orders = await allData.toArray()
      res.json(orders);
    })

    app.get('/users/:email', async(req,res) =>{
      const email = req.params.email;
      const hunt = {email : email};
      const user = await usersCollection.findOne(hunt);
      let isAdmin = false;
      if(user?.role === 'admin'){
         isAdmin = true
      }
      res.json({admin: isAdmin})
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result)
    })

    app.post('/orders', async(req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      
      res.json(result)
    })

    app.put('/users/admin', async(req, res) => {
      const user = req.body;
      const search = {email : user.email};
      const updateUser = {$set : {role:'admin'}}
      const result = await usersCollection.updateOne(search, updateUser)
      res.json(result);
    })

    }finally {
        
        // await client.close();
      }
}
run() .catch(console.dir);
app.get('/', (req, res) => {
  res.send('niche product server is running')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})