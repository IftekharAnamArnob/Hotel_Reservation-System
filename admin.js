const express = require('express');
const db = require('./database');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 7979;

db.connect((err) => {
    if (err) {
        console.log("Cannot connect to mysql server");
        return;
    }
    console.log("Connected to mysql server");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/Admin');

app.use(express.static(__dirname, + '/public/script.js'))
app.use("/public/css", express.static(__dirname + '/public/css/'));
app.use("/public/images", express.static(__dirname + '/public/images/'));

app.get('/', (req, res) => {
    console.log("Hello Admin Home");
    res.render('Admin_Home');
});

app.get('/bookings', (req, res) => {
    console.log("Hello Admin Bookings");
    res.render('Admin_panel');
});

app.get('/rooms', (req, res) => {
    console.log("Hello Admin Rooms");
    res.render('Admin_Room');
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});