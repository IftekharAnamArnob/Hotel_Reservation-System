const db = require('./database');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 6969;

db.connect((err) => {
    if(err) {
        console.log("Cannot connect to mysql server");
        return;
    }
    console.log("Connected to mysql server");
});

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.set('view engine', 'ejs');
app.use(express.static(__dirname, + '/public/script.js'))
app.use("/public/css", express.static(__dirname + '/public/css/'));
app.use("/public/images", express.static(__dirname + '/public/images/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname+ '/public/html/login.html');
});

app.get('/registration', (req, res) => {
    res.sendFile(__dirname + '/public/html/registration.html');
});

app.get('/book', (req, res) => {
    res.sendFile(__dirname + '/public/html/book.html');
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})