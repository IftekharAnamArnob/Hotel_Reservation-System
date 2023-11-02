const db = require('./database');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 6969;

db.connect((err) => {
    if(err) {
        console.log("Cannot connect to mysql server");
        return;
    }
    console.log("Connected to mysql server");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/html');

app.use(express.static(__dirname, + '/public/script.js'))
app.use("/public/css", express.static(__dirname + '/public/css/'));
app.use("/public/images", express.static(__dirname + '/public/images/'));

app.get('/', (req, res) => {
    console.log("Hello Home");
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/login', (req, res) => {
    console.log("Hello login");
    res.sendFile(__dirname + '/public/html/login.html');
});

app.get('/registration', (req, res) => {
    console.log("Hello registration");
    res.sendFile(__dirname + '/public/html/registration.html');
});

app.post('/room_availability', (req, res) => {
    console.log("Hello post room availability");
    
    const checkinDate = req.body['checkin-date'];
    const checkoutDate = req.body['checkout-date'];
  
    console.log("Check-in Date: " + checkinDate);
    console.log("Check-out Date: " + checkoutDate);
});

app.get('/room_availability', (req, res) => {
    console.log("Hello Room availability");

    const queryCount = 6; // The number of queries to run
    let completedQueries = 0; // Initialize the counter
    const available = [];

    const handleQueryResult = (err, result) => {
        if (err) {
            console.error('Error fetching available room count: ', err);
        } else {
            const availableRoomCount = result[0].roomCount;
            available.push(availableRoomCount);
        }

        completedQueries++;

        if (completedQueries === queryCount) {
            // Render the EJS template with room availability data
            console.log(available);
            res.render('room_availability', { available: available });
        }
    };

    const queries = [
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 1',
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 2',
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 3',
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 4',
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 5',
        'SELECT COUNT(*) AS roomCount FROM room WHERE is_available_now = 1 AND room_type_id = 6'
    ];

    queries.forEach((query) => {
        db.query(query, (err, results) => {
            handleQueryResult(err, results);
        });
    });
});

app.get('/book', (req, res) => {
    console.log("Hello book");
    res.sendFile(__dirname + '/public/html/book.html');
});



app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});