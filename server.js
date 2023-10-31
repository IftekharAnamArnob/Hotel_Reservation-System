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
    console.log("Helo login");
    res.sendFile(__dirname + '/public/html/login.html');
});

app.get('/registration', (req, res) => {
    console.log("Helo registration");
    res.sendFile(__dirname + '/public/html/registration.html');
});

app.get('/room_availability', (req, res) => {
    console.log("Hello room availability");
    const available = [];
    const queryCount = 6; // The number of queries to run
    let completedQueries = 0; // Initialize the counter

    const handleQueryResult = (err, result) => {
        if (err) {
            console.error('Error fetching available room count: ', err);
            return 0;
        }
        const availableRoomCount = result[0].roomCount;
        available.push(availableRoomCount);
        completedQueries++;

        if (completedQueries === queryCount) {
            // All queries have completed, send the response
            console.log(available);
            res.sendFile(__dirname + '/public/html/room_availability.html');
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

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});