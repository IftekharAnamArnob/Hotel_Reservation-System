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
    // res.render('Admin_panel');
    const sql = `SELECT * FROM reservation`;

    db.query(sql, (err, result) => {
        if(err) {
            console.log('Error fetching booking data from the database');
            res.redirect('/');
        } else {
            console.log('Successfully fetched the booking data');
            res.render('Admin_Panel', { rooms: result });
        }
    });
});

app.post('/updateBookings', (req, res) => {
    const { approved, rejected } = req.body;

    // Update the database with the approved and rejected bookings
    const updateQuery = `
        UPDATE reservation
        SET reservation_status = CASE
            WHEN reservation_id IN (${approved.join(',')}) THEN 'approved'
            WHEN reservation_id IN (${rejected.join(',')}) THEN 'rejected'
            ELSE reservation_status
        END;
    `;

    db.query(updateQuery, (err, result) => {
        if (err) {
            console.error('Error updating bookings:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Bookings updated successfully');
            res.json({ message: 'Bookings updated successfully' });
        }
    });
});

app.get('/confirm_decision', (req, res) => {
    console.log("Hello confirm decision");
    res.redirect('/');
});

app.get('/rooms', (req, res) => {
    console.log("Hello Admin Rooms");
    res.render('Admin_Room');
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});