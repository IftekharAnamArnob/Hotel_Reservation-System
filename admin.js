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
    console.log('Hello Admin');
    res.render('admin_login');
});

app.post('/admin_login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log(`Email: ${email}, Password: ${password}`);

    authenticateUser(email, password, (err, user) => {
        if(err) {
            console.log("Authentication error");
            res.redirect('/');
        } else {
            console.log("Admin authenticated");
            res.redirect('/home');
        }
    })
});

function authenticateUser(email, password, callback) {
    const sql = 'SELECT * FROM admin_data WHERE email = ? AND user_password = ?';
    db.query(sql, [email, password], (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (results.length > 0) {
        // User authenticated successfully
        callback(null, results[0]);
      } else {
        // User not found or invalid credentials
        callback('Invalid credentials', null);
      }
    });
};

app.get('/admin_registration', (req, res) => {
    console.log('Hello admin registration');
    res.render('admin_registration');
});

app.post('/submit_registration', (req, res) => {
    const { firstName, lastName, admin_type, email, phone, password } = req.body;

    const insertQuery = 'INSERT INTO admin_data (first_name, last_name, admin_type, email, phone, user_password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [firstName, lastName, admin_type, email, phone, password], (err, result) => {
        if (err) {
            console.error('Error inserting admin registration:', err);
            res.redirect('/admin_registration');
        } else {
            console.log('Admin Registration successful');
            res.redirect('/home');
        }
    });
});

app.get('/home', (req, res) => {
    console.log("Hello Admin Home");
    res.render('Admin_Home');
});

app.get('/bookings', (req, res) => {
    console.log("Hello Admin Bookings");
    // res.render('Admin_panel');
    const sql = `SELECT * FROM reservation WHERE reservation_status = 'Pending'`;

    db.query(sql, (err, result) => {
        if(err) {
            console.log('Error fetching booking data from the database');
            res.redirect('/home');
        } else {
            console.log('Successfully fetched the booking data');
            res.render('Admin_Panel', { rooms: result });
        }
    });
});

app.post('/updateBookings', (req, res) => {
    const { approved, rejected } = req.body;

    // Constructing the SQL update query
    let updateQuery = `
        UPDATE reservation
        SET reservation_status = CASE
    `;

    // Adding conditions for approved bookings
    if (approved.length > 0) {
        updateQuery += `WHEN reservation_id IN (${approved.join(',')}) THEN 'approved'\n`;
    }

    // Adding conditions for rejected bookings
    if (rejected.length > 0) {
        updateQuery += `WHEN reservation_id IN (${rejected.join(',')}) THEN 'rejected'\n`;
    }

    // Adding the default condition to keep the existing status
    updateQuery += 'ELSE reservation_status\nEND;';

    // Executing the update query
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
    res.redirect('/home');
});

app.get('/room_prices', (req, res) => {
    const sql = 'SELECT type_name, price_per_night FROM room_type';

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching room prices:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const roomData = result.map(row => ({
                room_type_name: row.type_name, // Corrected the property name
                price_per_night: row.price_per_night,
            }));
            res.json({ roomData });
        }
    });
});

app.post('/update_room_price', (req, res) => {
    const { roomType, newPrice } = req.body;

    const updateQuery = `
        UPDATE room_type
        SET price_per_night = ?
        WHERE type_name = ?;
    `;

    db.query(updateQuery, [newPrice, roomType], (err, result) => {
        if (err) {
            console.error('Error updating room price:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Room price updated successfully.');
            res.json({ success: true });
        }
    });
});

app.get('/rooms', (req, res) => {
    console.log("Hello Admin Rooms");
    res.render('Admin_Room');
});

app.get('/guest_detail/:guest_id', (req, res) => {
    const guestId = req.params.guest_id;
    // console.log(guestId);
    const sql = `SELECT * FROM guest WHERE guest_id = ?`;

    db.query(sql, [guestId], (err, result) => {
        if(err) {
            console.log('Error loading guest details');
            res.status(500).json({ error: 'Error loading guest details' });
        } else {
            res.json({ guestDetails: result });
        }
    });
});




app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});