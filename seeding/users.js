// admin password : 0101
// user password : 0000

const users = {

    "anushnewman@jmangroup.com":{
        name : "anushnewman",
        email : "anushnewman@jmangroup.com",
        password : "0101",
        role : "CEO",
        department : null,
        reportsTo : null,
    },

    "ashley@jmangroup.com":{
        name : "ashley",
        email : "ashley@jmangroup.com",
        password : "0101",
        role : "CFO",
        department : null,
        reportsTo : "anushnewman@jmangroup.com",
    },

    "leovalan@jmangroup.com":{
        name : "leovalan",
        email : "leovalan@jmangroup.com",
        password : "0101",
        role : "CTO",
        department : null,
        reportsTo : "anushnewman@jmangroup.com",
    },

    "vendeeshwaran@jmangroup.com":{
        name : "vendeeshwaran",
        email : "vendeeshwaran@jmangroup.com",
        password : "0000",
        role : "TM",
        department : "FS",
        reportsTo : "leovalan@jmangroup.com",
    },

    "sachinvias@jmangroup.com":{
        name : "sachinvias",
        email : "sachinvias@jmangroup.com",
        password : "0000",
        role : "TM",
        department : "DE",
        reportsTo : "leovalan@jmangroup.com",
    },

    "sivamalini@jmangroup.com":{
        name : "sivamalini",
        email : "sivamalini@jmangroup.com",
        password : "0000",
        role : "TM",
        department : "UI",
        reportsTo : "leovalan@jmangroup.com",
    },

    "gopinathramesh@jmangroup.com":{
        name : "gopinathramesh",
        email : "gopinathramesh@jmangroup.com",
        password : "0000",
        role : "TL",
        department : "FS",
        reportsTo : "vendeeshwaran@jmangroup.com",
    },

    "nivya@jmangroup.com":{
        name : "nivya",
        email : "nivya@jmangroup.com",
        password : "0000",
        role : "TM",
        department : "DE",
        reportsTo : "sachinvias@jmangroup.com",
    },

    "dhanasekar@jmangroup.com":{
        name : "dhanasekar",
        email : "dhanasekar@jmangroup.com",
        password : "0000",
        role : "TM",
        department : "UI",
        reportsTo : "sivamalini@jmangroup.com",
    },

}