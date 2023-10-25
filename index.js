const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const fashionCollection = client.db("fashionDB").collection("fashion");
    const userCollection = client.db("fashionDB").collection("user");
    const CustomerCollection = client.db("fashionDB").collection("customer");

    // Home page card to get
    app.get("/allBrands", async (req, res) => {
      const cursor = fashionCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // card showing only one brand
    app.get("/allCards/:name", async (req, res) => {
      console.log(req.query.name);
      const cursor = userCollection.find({ brandName: req.params.name });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/addProductToCart", async (req, res) => {
      const { userEmail, productData } = req.body;

      try {
        // Get the product details from the fashion collection

        // Add the product to the user's cart
        console.log(userEmail, productData);
        const result = await CustomerCollection.updateOne(
          { userEmail: userEmail },
          { $push: { userCart: productData } }
        );

        res.status(201).json({
          message: "Product added to the cart successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error adding product to the cart:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.post("/addNewCustomer", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);

      try {
        const result = await CustomerCollection.insertOne(newUser);
        console.log("Inserted customer:", result.ops);

        res.status(201).json({
          message: "Customer added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding user to MongoDB:", error);

        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // sigle cart Details collect
    app.get("/cartDetails", async (req, res) => {
      console.log(req.query.id);
      const cursor = userCollection.find({ _id: new ObjectId(req.query.id) });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/deleteCardData", async (req, res) => {
      console.log(req.body);
      const { userEmail, productId } = req.body;
      try {
        const user = await CustomerCollection.findOne({
          userEmail: userEmail,
        });

        const result = await CustomerCollection.updateOne(
          { userEmail: userEmail },
          {
            $pull: {
              userCart: { _id: productId },
            },
          }
        );

        if (result.modifiedCount === 1) {
          console.log("Product deleted successfully");
          res.json({
            success: true,
            message: "Product deleted successfully",
          });
        } else {
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }
      } catch (error) {
        console.error("Error updating user cart:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });
    app.get("/getCartData", async (req, res) => {
      const usermail = req.query.userEmail;
      console.log(usermail);

      try {
        const userData = await CustomerCollection.findOne({
          userEmail: usermail,
        });
        const userCart = userData ? userData.userCart : [];

        res.send(userCart);
      } catch (error) {
        console.error("Error getting user cart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/allBrands", async (req, res) => {
      const newBrand = req.body;
      console.log(newBrand);
      const result = await fashionCollection.insertOne(newBrand);
      res.send(result);
    });

    app.post("/allCards", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/allCards/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Delete from detabase", id);
      const query = { _id: id };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // signup Related API

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("my lovely jubly fashion server is running  !");
});

app.listen(port, () => {
  console.log(`Fshion Apparel is running on port: ${port}`);
});
