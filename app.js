import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import User from './models/Users.js'
import mongoose from 'mongoose'

const app = express()

dotenv.config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000
const MONGO_USER = process.env.MONGO_USER
const MONGO_PSWD = process.env.MONGO_PSWD

const mongoURI = `mongodb+srv://${MONGO_USER}:${MONGO_PSWD}@organizationchart.wvqbdvo.mongodb.net/OrganizationChart`; // Your MongoDB URI
const dbName = 'OrganizationChart'; // Your database name
const collectionName = 'Users'; // Your collection name

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false, // Disable command bufferin
  });

const HIERARCHY = {
    PR : ['CFO','MANAGER','SENIOR_HR','JUNIOR_HR'],
    TECH : ['CTO','TRIBE_MASTER','TEAM_LEAD','DEVELOPER']
}

const DEPARTMENTS = {
    PR : ['BUSINESS_MANAGEMENT','FINANCIAL_SERVICES'],
    TECH : ['FULL_STACK','DATA_ENGINEERING','UI']
}

// GET - get all users - TEST ROUTE
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

// POST - get hierarchy 
app.post('/api/getorgchart', async (req, res) => {
    try {
        const bodyParameters = {
            name: req.body.name,
            email: req.body.email,
            department: req.body.department,
            reportsTo: req.body.reportsTo
        };

        console.log("check",bodyParameters)

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

        resultantHierarchy = hierarchyArr.reverse();
        console.log("Final array",hierarchyArr)

        res.status(200).json({ hierarchy: resultantHierarchy });
    } catch (error) {
        console.error('Error retrieving hierarchy:', error);
        res.status(500).send('Internal Server Error');
    }
});


//  GET /API/GETROLES?DOMAIN="TECH" (/"PR") -> returns the array of all roles from hierarchical array
app.get('/api/getroles', async (req, res) => {
    try {

        const DOMAIN = req.query.DOMAIN
        
        res.status(200).json({
            message : `sent roles from domain : ${DOMAIN}`,
            data : HIERARCHY[DOMAIN]
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }
})

// GET /API/GETDEPT?DOMAIN="TECH" (/"PR") -> returns the array of all DEPARTMENTS in the particular domain
app.get('/api/getdept',async (req,res)=>{

    try {

        const DOMAIN = req.query.DOMAIN

        res.status(200).json({
            message : `sent all departments in a ${DOMAIN}`,
            data : DEPARTMENTS[DOMAIN]
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }

})

// GET /API/LISTSENIORNAMES?ROLE="TRIBE_MASTER"&DEPT="FULL_STACK" -> return all the emails of immediate senior in a department
app.get('/api/listseniornames', async (req, res) =>{

    try {

        const ROLE = req.query.ROLE;
        const DEPARTMENT = req.query.DEPARTMENT;
        
        var SENIOR_ROLE;

        let SENIOR_EMAILS = []

        // GET THE IMMEDIATE SENIOR ROLE
        if(HIERARCHY.PR.includes(ROLE)){
            SENIOR_ROLE = HIERARCHY.PR[HIERARCHY.PR.indexOf(ROLE)-1]
        } else if (HIERARCHY.TECH.includes(ROLE)){
            SENIOR_ROLE = HIERARCHY.TECH[HIERARCHY.TECH.indexOf(ROLE)-1]
        } else {
            res.status(505).send('bad input');
        }

        console.log(SENIOR_ROLE,"LOG")

        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const cursor = collection.find({role:SENIOR_ROLE, department:DEPARTMENT}); // Find all documents

        const documents = await cursor.toArray(); // Convert cursor to array

        documents.forEach(doc => {
            SENIOR_EMAILS.push(doc.email)
            console.log('doc log',doc)
        });

        client.close(); // Close the connection

        res.status(200).send({
            message : "senior email arrays",
            data : SENIOR_EMAILS
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }

})

// POST /API/ADDUSER -> SEND ALL THE DETAILS IN THE FORM, REQUEST.BODY
app.post('/api/adduser', async (req, res) =>{

    try{

        const formData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role : req.body.role,
            department: req.body.department,
            reportsTo: req.body.reportsTo
        };
    
        const user = await User.create(formData);
        console.log('User saved:', user);

        res.status(200).json({ message: 'created user' });

    }
    catch(error){
        // Handle errors and send an error response back to the client
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
