const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6avkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
      const jobsCollections = client.db('jobsDB').collection('jobs')

      // post jobs from the client
      app.post('/jobs', async (req, res)=>{
        const newJob = req.body;
        const result = await jobsCollections.insertOne(newJob)
        res.send(result)
      })
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
