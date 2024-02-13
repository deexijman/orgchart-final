import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import User from './models/Users.js'
import mongoose from 'mongoose'
import Admin from './models/Admin.js'
import bcrypt from "bcrypt"

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
    PR: ['CFO', 'MANAGER', 'SENIOR_HR', 'JUNIOR_HR'],
    TECH: ['CTO', 'TRIBE_MASTER', 'TEAM_LEAD', 'DEVELOPER']
}

const DEPARTMENTS = {
    PR: ['BUSINESS_MANAGEMENT', 'FINANCIAL_SERVICES'],
    TECH: ['FULL_STACK', 'DATA_ENGINEERING', 'UI']
}

// GET - get all users - TEST ROUTE
app.get('/api/getallusers', async (req, res) => {
    try {



        const allUsers = await User.find({}); // Find all documents



        // allUsers.forEach(doc => {
        //     console.log('here', doc); // Log each document
        // });



        res.status(200).json({
            message: 'sending all user datas',
            data: allUsers
        });
    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST - get hierarchy for chart
app.post('/api/getorgchart', async (req, res) => {
    try {
        const bodyParameters = {
            name: req.body.name,
            email: req.body.email,
            department: req.body.department,
            reportsTo: req.body.reportsTo
        };

        // console.log("check",bodyParameters)



        const hierarchyArr = [];
        let nextReportsTo = bodyParameters.reportsTo;
        let currentEmailHolder = bodyParameters.email;

        var firstEntry = true

        do {

            var cursor;

            if (firstEntry === true) {
                cursor = await User.find({ reportsTo: nextReportsTo, email: currentEmailHolder });
                firstEntry = false
            } else {
                cursor = await User.find({ email: nextReportsTo });
            }

            const documents = cursor;

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

            console.log("show next reports to : ", nextReportsTo)

        } while (nextReportsTo !== null);



        //resultantHierarchy = hierarchyArr.reverse();

        // console.log("Final array",hierarchyArr)

        res.status(200).json({ hierarchyArr });
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
            message: `sent roles from domain : ${DOMAIN}`,
            data: HIERARCHY[DOMAIN]
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }
})

// GET /API/GETDEPT?DOMAIN="TECH" (/"PR") -> returns the array of all DEPARTMENTS in the particular domain
app.get('/api/getdept', async (req, res) => {

    try {

        const DOMAIN = req.query.DOMAIN

        res.status(200).json({
            message: `sent all departments in a ${DOMAIN}`,
            data: DEPARTMENTS[DOMAIN]
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }

})

// GET /API/LISTSENIORNAMES?ROLE="TRIBE_MASTER"&DEPT="FULL_STACK" -> return all the emails of immediate senior in a department
app.get('/api/listseniornames', async (req, res) => {

    try {

        const ROLE = req.query.ROLE;
        const DEPARTMENT = req.query.DEPARTMENT;

        var SENIOR_ROLE;



        // GET THE IMMEDIATE SENIOR ROLE
        if (HIERARCHY.PR.includes(ROLE)) {
            SENIOR_ROLE = HIERARCHY.PR[HIERARCHY.PR.indexOf(ROLE) - 1]
        } else if (HIERARCHY.TECH.includes(ROLE)) {
            SENIOR_ROLE = HIERARCHY.TECH[HIERARCHY.TECH.indexOf(ROLE) - 1]
        } else {
            res.status(505).send('bad input');
        }

        console.log(SENIOR_ROLE, "LOG")


        const SENIOR_EMAILS = await User.find({ role: SENIOR_ROLE, department: DEPARTMENT }); // Find all documents

        res.status(200).send({
            message: "senior email arrays",
            data: SENIOR_EMAILS
        });

    } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
    }

})

// POST /API/ADDUSER -> SEND ALL THE DETAILS IN THE FORM, REQUEST.BODY
app.post('/api/adduser', async (req, res) => {

    try {

        const formData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            department: req.body.department,
            reportsTo: req.body.reportsTo
        };

        const user = await User.create(formData);
        console.log('User saved:', user);

        res.status(200).json({ message: 'created user' });

    }
    catch (error) {
        // Handle errors and send an error response back to the client
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})




// user / admin 
// /api/login  ROLE = "USER/ADMIN" , EMAIL , PASSWORD WILL BE TAKEN IN BODY -> LOGGING IN
app.post('/api/login', async (req, res) => {
    try {
        const ROLE = req.body.ROLE
        const EMAIL = req.body.EMAIL
        const PASSWORD = req.body.PASSWORD

        if (ROLE === "USER") {
            //FIND IF USER IS THERE
            const user = await User.findOne({ email: EMAIL })
            !user && res.status(400).json("Wrong credentials!");
            console.log(user)
            //IF USER IS THERE CHECK IF PASSWORD IS CORRECT
            //const isvalidated = await bcrypt.compare(PASSWORD,user.password)
            //   !isvalidated && res.status(400).json("Wrong credentials!");

            const { name, email } = user

            res.status(200).json({
                name: name,
                email: email
            })


        }

        else if (ROLE === "ADMIN") {

            //FIND IF admin IS THERE
            const admin = await Admin.findOne({ email: EMAIL })
            console.log(admin)
            !admin && res.status(400).json("Wrong credentials!");
            //IF admin IS THERE CHECK IF PASSWORD IS CORRECT
            const isvalidated = await bcrypt.compare(PASSWORD, admin.password)
            !isvalidated && res.status(400).json("Wrong credentials!");

            const { name, email } = admin

            res.status(200).json({
                name: name,
                email: email
            })
        }

        else {
            res.status(400).json({
                message: 'role not available'
            })
        }
    }
    catch (e) {
        res.status(500).json({
            'message': 'role has to be either user or admin'
        })
    }
})

// register   admin  -> /api/register/admin all details like   NAME EMAIL PASSWORD will be sent in body.
app.post('/api/register/admin', async (req, res) => {

    
        try {
            
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(req.body.password, salt);


            const email = req.body.email
          
            const admin = {
                name: req.body.name,
                email: req.body.email,
                password: hashedPass,
            }
            await Admin.create(admin)
            console.log(admin)
            res.status(200).json({ email: email });
        } catch (err) {
            res.status(500).json({
                'message': 'FAILED TO CREATE A USER'
            });
        }
    
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
