var mysql = require('mysql');

var connectionVariables = {
    host: "127.0.0.1",
    user: "root",
    password: "mysql123",
    database: "DMV_schema"
};

var connection = mysql.createConnection(connectionVariables);

//Database connection establishment
connection.connect(function(error){
    if(error){
        console.log("error with the connection "+ JSON.stringify(error));
    }else{
        console.log("Connected to the DataBase");
    }
});

module.exports = connection; 