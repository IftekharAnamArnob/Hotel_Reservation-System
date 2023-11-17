const db = require('./database');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = process.env.PORT || 6969;

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
app.set('views', __dirname + '/public/html');
// app.set('views', path.join(__dirname, 'views'));


app.use(express.static(__dirname, + '/public/script.js'))
app.use("/public/css", express.static(__dirname + '/public/css/'));
app.use("/public/images", express.static(__dirname + '/public/images/'));


let available = [];
var requestedCheckinDate = 'NULL';
var requestedCheckoutDate = 'NULL';

app.get('/', (req, res) => {
    available.length = 0;
    console.log("Hello Home");
    res.render('index');
});

app.get('/login', (req, res) => {
    console.log("Hello login");
    res.sendFile(__dirname + '/public/html/login.html');
});

app.get('/registration', (req, res) => {
    console.log("Hello registration");
    res.sendFile(__dirname + '/public/html/registration.html');
});

app.get('/room_availability', (req, res) => {
    available.length = 0;
    console.log("Hello Room availability");

    requestedCheckinDate = req.query['checkin-date'];
    requestedCheckoutDate = req.query['checkout-date'];
    console.log("Requested Check in Date: " + requestedCheckinDate);
    console.log("Requested Check out Date: " + requestedCheckoutDate);

    const queryCount = 6;
    let completedQueries = 0;

    const handleQueryResult = (err, result) => {
        if (err) {
            console.error('Error fetching available room count: ', err);
        } else {
            const availableRoomCount = result[0].roomCount;
            available.push(availableRoomCount);
        }

        completedQueries++;

        if (completedQueries === queryCount) {
            console.log(available);
            res.render('room_availability', { available: available });
        }
    };

    const roomTypeIds = [1, 2, 3, 4, 5, 6];

    const queries = roomTypeIds.map((roomId) => {
        return `SELECT COUNT(*) AS roomCount FROM room WHERE room_type_id = ${roomId} AND 
        ((busy_from >= '${requestedCheckoutDate}' OR busy_upto <= '${requestedCheckinDate}') OR (is_available_now = 1 AND busy_from IS NULL AND busy_upto IS NULL))`;
    });

    queries.forEach((query) => {
        db.query(query, (err, results) => {
            handleQueryResult(err, results);
        });
    });
});

app.get('/book', (req, res) => {
    console.log("Hello book");
    res.render('book', { available: available });
    // res.render('book');
});

app.get('/apply_book', (req, res) => {
    console.log("Hello apply book");

    const firstName = req.query['first_name'];
    const lastName = req.query['last_name'];
    const passportNo = req.query['passport_no'];
    const nidNo = req.query['nid_no'];
    const occupation = req.query['occupation'];
    const age = req.query['age'];
    const email = req.query['email'];
    const mobile = req.query['contact_no'];
    var roomType = req.query['type_name'];
    const numberOfGuests = req.query['total_guests'];

    const sql = 'INSERT INTO guest (first_name, last_name, passport_no, nid_no, occupation, age, email, contact_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [firstName, lastName, passportNo, nidNo, occupation, age, email, mobile];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into guest table: ' + err);
        } else {
            console.log('Data inserted successfully into the guest table: ');
        }
    });

    db.query(`SELECT guest_id FROM guest WHERE nid_no = ?`, [nidNo], (err, result) => {
        if (err) {
            console.log("Error getting nid no");
        } else {
            if (result.length > 0) {
                const guestId = result[0].guest_id;
                console.log('Guest ID: ', guestId);

                const sql2 = `INSERT INTO reservation (guest_id, check_in_date, check_out_date, total_guests, room_type_name) VALUES (?, ?, ?, ?, ?)`;
                const values2 = [guestId, requestedCheckinDate, requestedCheckoutDate, numberOfGuests, roomType];

                db.query(sql2, values2, (err, result1) => {
                    if (err) {
                        console.error('Error inserting data into reservation table: ' + err);
                    } else {
                        console.log('Data inserted successfully into the reservation table.');

                        db.query('SELECT reservation_id, reservation_status FROM reservation WHERE guest_id = ?', [guestId], (err, resultId) => {
                            if (err) {
                                console.error('Error fetching reservation ID: ' + err);
                            } else {
                                const reservationId = resultId[0].reservation_id;
                                console.log('Reservation ID:', reservationId);
                                const reservationStatus = resultId[0].reservation_status;

                                const bookingData = {
                                    reservationId: reservationId,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    checkInDate: requestedCheckinDate,
                                    checkOutDate: requestedCheckoutDate,
                                    reservationStatus: reservationStatus,
                                };

                                console.log(bookingData);

                                res.render('apply_success', { bookingData });
                            }
                        });
                    }
                });

            } else {
                console.log("No result found fot the given nid_no");
            }
        }
    });
});

app.get('/cancel_book', (req, res) => {
    console.log("Hello Cancel Booking");
    const mismatchNotification = "No match";
    res.render('cancel_booking', { mismatchNotification });
});

app.post('/confirm_cancellation', (req, res) => {
    console.log("Hello Confirm Cancellation");
    const reservationId = req.body.reservation_id;
    const nidNo = req.body.nid_no;
    console.log('Reservation ID to cancel: ' + reservationId);
    console.log('NID to cancel: ' + nidNo);

    const sql = `SELECT CASE WHEN COUNT(*) > 0 THEN 'Match' ELSE 'No Match' END AS result FROM
    reservation r JOIN guest g ON r.guest_id = g.guest_id
    WHERE r.reservation_id = ? AND g.nid_no = ?;`

    const values = [reservationId, nidNo];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("Error to search the cancellation data: " + err);
        } else {
            console.log("Reservation id and nid matches?: " + result[0].result);

            const mismatchNotification = result[0].result;
            // console.log(mismatchNotification);
            if (result[0].result == 'No Match') {
                console.log("Reservation ID and NID do not match!");
                res.render('cancel_booking', { mismatchNotification });
            } else {
                console.log("Reservation ID and NID match!");
                const sql = `DELETE FROM reservation WHERE reservation_id = ?`;
                db.query(sql, [reservationId], (err, result) => {
                    if (err) {
                        console.log("Error removing the reservation data");
                    } else {
                        console.log("Successfully removed the reservation data");
                    }
                });
                const sql1 = `DELETE FROM guest WHERE nid_no = ?`;
                db.query(sql1, [nidNo], (err, result) => {
                    if (err) {
                        console.log("Error removing the NID data");
                    } else {
                        console.log("Successfully removed the NID data");
                    }
                });
                res.render('cancellation');
            }
        }
    });

});

app.post('/store_reservation', (req, res) => {
    const reservationId = req.body.reservationID;
    console.log('Received reservation ID: ', reservationId);

    const sql = `SELECT reservation_id, guest_id, check_in_date, check_out_date, reservation_status FROM reservation WHERE reservation_id = ?`;
    
    db.query(sql, [reservationId], (err, result1) => {
        if(err) {
            console.log('Failed to fetch Reservation data');
        } else {
            if(result1.length > 0) {
                // console.log(`${result1[0].guest_id} ${result1[0].check_in_date} ${result1[0].check_out_date} ${result1[0].reservation_status}`);

                const sql2 = `SELECT first_name, last_name, email FROM guest WHERE guest_id = ?`;

                db.query(sql2, [result1[0].guest_id], (err2, result2) => {
                    if(err2) {
                        console.log('Failed to fetch Guest Data');
                    } else {
                        if(result2.length > 0) {
                            console.log('Successfully fetched guest data');

                            const reservationId1 = result1[0].reservation_id;
                            const firstName = result2[0].first_name;
                            const lastName = result2[0].last_name;
                            const email = result2[0].email;
                            const checkInDate = result1[0].check_in_date.toISOString().split('T')[0];
                            const checkOutDate = result1[0].check_out_date.toISOString().split('T')[0];
                            const reservationStatus = result1[0].reservation_status;

                            const bookingData = {
                                reservationId: reservationId1,
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                checkInDate: checkInDate,
                                checkOutDate: checkOutDate,
                                reservationStatus: reservationStatus,
                            };

                            console.log(bookingData);
                            res.render('apply_success', { bookingData });
                        } else {
                            console.log('No such guest exists');
                            res.redirect('/');
                        }
                    }
                });

            } else {
                console.log('No such reservation exists');
                res.redirect('/');
            }
        }
    });
});


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});