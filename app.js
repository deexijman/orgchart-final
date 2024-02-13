import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

const app = express()

dotenv.config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const mongoURI = `mongodb+srv://deexithparand:deexithatorg@organizationchart.wvqbdvo.mongodb.net/`; // Your MongoDB URI
const dbName = 'EmployeeData'; // Your database name
const collectionName = 'Users'; // Your collection name

app.get('/api/getallusers', async (req, res) => {
    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const cursor = collection.find({}); // Find all documents

        const documents = await cursor.toArray(); // Convert cursor to array

        documents.forEach(doc => {
            console.log('here', doc); // Log each document
        });

        client.close(); // Close the connection

        res.status(200).send('Documents logged successfully');
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }
});

// app.post('/api/getorgchart', async (req, res) => {
//     try {

//         var bodyParameters = {
//             name: req.body.name,
//             email: req.body.email,
//             department: req.body.department,
//             reportsTo: req.body.reportsTo
//         }

//         // already reportsTo falls in same category
//         const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
//         await client.connect();

//         const db = client.db(dbName);
//         const collection = db.collection(collectionName);

//         // response store
//         var hierarchyArr = []
//             nextReportsTo = bodyParameters.reportsTo


//         // just loop unitl reports to is null
//         do {

//             const cursor = collection.find({
//                 role: req.body.department,
//                 reportsTo : nextReportsTo
//             });    // Find all documents

//             const documents = await cursor.toArray(); // Convert cursor to array

//             var latestdoc = {}

//             documents.forEach(doc => {
//                 latestdoc = doc // check and block if the doc is undefined
//                 nextReportsTo = doc.reportsTo // update the nextReportsTo

//                 if(doc){
//                     hierarchyArr.push(doc)
//                 }
                
//             });

//         }
//         while (nextReportsTo !== null && latestdoc);


//         client.close(); // Close the connection

//         res.status(200).send('Hierarchy logged successfully');
//     } catch (error) {
//         console.error('Error retrieving documents:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


app.post('/api/getorgchart', async (req, res) => {
    try {
        const bodyParameters = {
            name: req.body.name,
            email: req.body.email,
            department: req.body.department,
            reportsTo: req.body.reportsTo
        };

        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const hierarchyArr = [];
        let nextReportsTo = bodyParameters.reportsTo;
        let currentEmailHolder = bodyParameters.email;

        var firstEntry = true

        do {

            var cursor;

            if(firstEntry===true) {
                cursor = collection.find({ reportsTo: nextReportsTo, email: currentEmailHolder });
                firstEntry=false
            } else {
                cursor = collection.find({ email: nextReportsTo });
            }
            
            const documents = await cursor.toArray();

              if (documents.length > 0) {
                console.log("entry true")
                const latestDoc = documents[0]; // Assuming only one document matches reportsTo
                hierarchyArr.push(latestDoc);

                nextReportsTo = latestDoc.reportsTo; 
            } else {
                console.log("entry false")
                // If no document matches nextReportsTo, terminate the loop
                break;
            }

            console.log("show next reports to : ",nextReportsTo)

        } while (nextReportsTo !== null);

        client.close();

        console.log("Final array",hierarchyArr)

        res.status(200).json({ hierarchy: hierarchyArr });
    } catch (error) {
        console.error('Error retrieving hierarchy:', error);
        res.status(500).send('Internal Server Error');
    }
});




const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
