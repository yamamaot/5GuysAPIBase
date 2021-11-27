const { request } = require('express');
const express = require('express');
//Make sure to have bodyParser in here!
const bodyParser = require('body-parser');
const mysql = require('mysql');



//Create connection
//Need to update this with the credentials for our VM or wherever we are testing
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


//make sure to use bodyParser because it's the backbone of the JSON parsing
const app = express();
app.use(express.json());
app.use(bodyParser.json());






//Compares what is in stock to what is being requested.
app.post('/sqlstocktest', (req, res) => {
    let sql = `SELECT sku, name, price,  
    CASE
        WHEN quantity < ${req.body.requested} THEN quantity
        ELSE ${req.body.requested}
    END AS quantity, type, discount
        
    FROM tests WHERE sku = '${req.body.sku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;

        res.send(result);
    });    
});


//Simply throws back all the data, but uses the requested amount.
//This is because we assume that the request will have the updated amount from the first step.
app.post('/sqlpricetest', (req, res) => {
    let sql = `SELECT sku, name, price,  ${req.body.requested} AS quantity, type, discount        
    FROM tests WHERE sku = '${req.body.sku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;

        res.send(result);
    });    
});

//Simple test for making sure json reading and writing is working correctly.
app.post('/jsontest', (req, res) => {
    res.setHeader('content-type', 'application/json');
    console.log(req.body);
    let myValue = req.body.sku;
    res.json({
        sku: myValue
    });
});





















//deprecated or unused code below


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
    let sql = 'CREATE TABLE tests(sku VARCHAR(255), name VARCHAR(255), price int, quantity int, type VARCHAR(255), discount FLOAT(2), PRIMARY KEY(sku))';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('tests table created');
    });
});

//Create data route
app.get('/adddata1', (req, res) => {
    let dataset = {sku:'so1001', name:'Absolute_Vodka_1.5L_case', price:'32', quantity:'25', type:'Liquor', discount:'0.1'};
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
app.get('/getdata/:sku', (req, res) => {
    let sql = `SELECT * FROM tests WHERE sku = ${req.params.sku}`;
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


//SQL testing methods
app.get('/jsontest1', (req, res) => {

    let itemSku = 'so1001';
    let sql = `SELECT quantity FROM tests WHERE sku = '${itemSku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        let instock = result[0].quantity;
        console.log(instock);
    });
    
    res.send('check the console for the value');
});


//calls a stockTest method that compares values
//then these resulting objects are pushed to an array that can be wrapped up in a json

app.get('/stocktest', (req, res) => {
    let resultArray = [];

    resultArray.push(stockTest('so1001', 20));
    resultArray.push(stockTest('so1001', 30));

    console.log('Here is the full array of results:')
    console.log(resultArray);
    res.send('check the console for the value');
});


//calling the function that retrieves prices and discounts.

app.get('/pricetest', (req, res) => {
    let resultArray = [];
    resultArray.push(priceTest('so1001', 20));

    console.log('Here is the full array of results')
    console.log(resultArray);
    res.send('check the console for the value');
});

//stock testing function, remember to change the sql queries further along in testing
function stockTest(itemSku, requestedAmt){
    let returnObject = null;
    var instock;
    
    let sql = `SELECT quantity FROM tests WHERE sku = '${itemSku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        
        instock = result[0].quantity;
        console.log('item sku: ' + itemSku);
        console.log('in stock: ' + instock);        
        console.log('requested amount: ' + requestedAmt + '\n');
        returnObject = stockTestReturn(itemSku, requestedAmt, instock);

    });
    
    return returnObject;
    //console.log(returnObject);
    
}

//nested function that tries to parse instock vs requested
function stockTestReturn(itemSku, requestedAmt, instock){
    let returnObject1 = null;
    if (instock < requestedAmt){
        returnObject1 = {
            sku : itemSku,
            quantity : instock
        }
        console.log('Reduced to fit amount in stock\n');

    } else {
        returnObject1 = {
            sku : itemSku,
            quantity : requestedAmt
        }
        console.log('All requested items retrieved\n');
    }
    return returnObject1;
}

//retrieves the price and discount amounts from the database
function priceTest(itemSku, requestedAmt){
    let returnObject = null;
    var price;
    var discount;
    let sql = `SELECT price FROM tests WHERE sku = '${itemSku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        //console.log(result);
        price = result[0].price;
        console.log(price);
    });
    let sql2 = `SELECT discount FROM tests WHERE sku = '${itemSku}'`;
    let query2 = db.query(sql2, (err, result) => {
        if (err) throw err;
        //console.log(result);
        discount = result[0].discount;
        console.log(discount);
    });

    returnObject = priceTestReturn(itemSku, requestedAmt, price, discount);
    return returnObject;
}

//calculates the total price based upon the requested amount and the discount
function priceTestReturn(itemSku, requestedAmt, price, discount){
    var returnObject2;
    var totalPrice = (requestedAmt * price * (1-discount));
    returnObject2 = {
        sku : itemSku,
        quantity : requestedAmt,
        price : price,
        totalPrice : totalPrice
    }
    console.log(returnObject2)
}

//URL can be used to insert the sku as well
app.get('/jsontest1/:sku', (req, res) => {
    
    let sql = `SELECT quantity FROM tests WHERE sku = '${req.params.sku}'`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        let instock = result[0].quantity;
        console.log(instock);
    });
    
    res.send('check the console for the value');
});









app.listen('3000', () => {
    console.log('Server started on port 3000');
});

