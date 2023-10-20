const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xq1u8gq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const fashionCollection = client.db('fashionDB').collection('fashion');
    const userCollection = client.db('fashionDB').collection('user');

    app.get('/allBrands', async (req, res) => {
      const cursor = fashionCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get('/allCards/:name', async (req, res) => {
      console.log(req.query.name);
      const cursor = userCollection.find({ brandName: req.params.name });
      const result = await cursor.toArray()
      res.send(result);
    })

    app.post('/allBrands', async (req, res) => {
      const newBrand = req.body;
      console.log(newBrand);
      const result = await fashionCollection.insertOne(newBrand);
      res.send(result);
    })



    app.post('/allCards', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.delete('/allCards/:id', async (req, res) => {
      const id = req.params.id;
      console.log('Delete from detabase', id);
      const query = { _id: id }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("my lovely jubly fashion server is running  !")
})

app.listen(port, () => {
  console.log(`Fshion Apparel is running on port: ${port}`)
})