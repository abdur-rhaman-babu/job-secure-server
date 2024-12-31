const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6avkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    const db = client.db("jobsDB");
    const jobsCollections = db.collection("jobs");
    const bidsCollections = db.collection("bids");

    // post or create jobs from the client
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollections.insertOne(newJob);
      res.send(result);
    });

    // get job form server
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollections.find().toArray();
      res.send(result);
    });

    // get data wiht email system-01
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobsCollections.find(query).toArray();
      res.send(result);
    });

    // // get data wiht email system-02
    // app.get('/myPostedJob', async (req, res)=>{
    //     const email = req.query.email;
    //     const query = {'buyer.email': email}
    //     const result = await jobsCollections.find(query).toArray()
    //     res.send(result)
    // })

    // delete job from db
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.deleteOne(query);
      res.send(result);
    });

    // get job for update
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.findOne(query);
      res.send(result);
    });

    // post job with update
    app.post("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const job = req.body;
      const updatedJob = {
        $set: job,
      };
      const options = { upsert: true };
      const result = await jobsCollections.updateOne(
        filter,
        updatedJob,
        options
      );
      res.send(result);
    });

    // get single job for details page
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.findOne(query);
      res.send(result);
    });

    // post bid api
    app.post("/add-bid", async (req, res) => {
      const bidData = req.body;

      // if you have already placed a bid on this job
      const query = { email: bidData.email, jobId: bidData.jobId };
      const alreadyExsist = await bidsCollections.findOne(query);
      if (alreadyExsist) {
        return res.status(400).send("you already placed a bid on this job");
      }
      
      const result = await bidsCollections.insertOne(bidData);

      // bid count
      const filter = { _id: new ObjectId(bidData.jobId) };
      const update = {
        $inc: { bid_count: 1 },
      };
      const updateBid = await jobsCollections.updateOne(filter, update);
      // console.log(updateBid)
      res.send(result);
    });

    app.get('/add-bids', async (req, res)=>{
      const email = req.query.email;
      const query = {email: email}
      const result = await bidsCollections.find(query).toArray()
      res.send(result)
    })

  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
