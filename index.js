const express = require('express');
const mysql = require('mysql');

//Create connection
const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'nodemysql'
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected');
});

const app = express();

//Create db
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodemysql';
    db.query(sql, (err, result) =>{
        if(err) throw err;
        console.log(result);
        res.send('database created');
    });
});

//Create table route
app.get('/createtable', (req, res) => {
    let sql = 'CREATE TABLE tests(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('tests table created');
    });
});

//Create data route
app.get('/adddata1', (req, res) => {
    let dataset = {title:'Post One', body:'This is post number one'};
    let sql = 'INSERT INTO tests SET ?';
    let query = db.query(sql, dataset, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('data 1 added');
    });
});

//Get data route
app.get('/getdata', (req, res) => {
    let sql = 'SELECT * FROM tests';
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(result);
    });
});

//Get specific data route
app.get('/getdata/:id', (req, res) => {
    let sql = `SELECT * FROM tests WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('data fetched');
    });
});

//Update specific data route
app.get('/updatedata/:id', (req, res) => {
    let newTitle = 'Updated Title';
    let sql = `UPDATE tests SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('data updated');
    });
});

//Delete specific data route
app.get('/deletedata/:id', (req, res) => {
    let sql = `DELETE FROM tests WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('data deleted');
    });
});

//Returning JSON object
//Probably won't use this as we can't add to the json object dynamically
app.get('/returnfulljson', (req, res) => {
    let sql = `SELECT * FROM tests WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
    });
    res.json([
        {firstName : 'John', lastName : 'Doe'},
        {firstName : 'John', lastName : 'Dee'},
        {firstName : 'John', lastName : 'Doo'},
        {firstName : 'John', lastName : 'Dom'}
    ]);
});

//Writing generic objects to an array and responding with a json of them
app.get('/jsonwritingtest', (req, res) => {
    const dog = {
        name: 'Manson',
        breed: 'Poodle',
        color: 'black'
    }
    const cat = {
        name: 'Penny',
        breed: 'Domestic Shorthair',
        color: 'Brown'
    }
    pets = new Array();
    pets.push(dog);
    pets.push(cat);
    const jsonData = JSON.stringify(pets, null, 2)
    res.send(jsonData);
});


//Ideas for walking down the SQL:
//Using the last index number as a "count", then looping requests for that count
//Being able to pull as many requests from the database as you need

app.listen('3000', () => {
    console.log('Server started on port 3000');
});

