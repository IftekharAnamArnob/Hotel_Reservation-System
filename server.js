const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');


const app = express();

const PORT = 6969 || process.env.PORT;

db.connect((err) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log('Connected to mysql server');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public')); // To send html files along with css

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/index.html');
});

// Login actions
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/pages/login.html');
    app.post('/login-submit', (req, res) => {
        const data = req.body;
        const sql = 'SELECT * FROM user_data WHERE email = ? AND pass = ?';

        db.query(sql, [data.email, data.pass], (err, result) => {
            if(result.length == 0) {
                res.send('Wrong credentials');
            } else {
                res.send('User logged in');
                console.log(`${data.email} logged in`);
            }
        });
    });
});

// Signup actions 
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/pages/signup.html');
    app.post('/signup-submit', (req, res) => {
        const data = req.body;
        const sql = 'INSERT INTO user_data (first_name, last_name, email, phone, pass) VALUES (?, ?, ?, ?, ?)';
    
        if(data.pass == data.confirmPass) {
            db.query(sql, [data.first_name, data.last_name, data.email, data.phone, data.pass], (err, result) => {
                if(err) {
                    console.err('mySQL query error: ', err);
                    res.send('Error saving the data');
                } else {
                    console.log('User registered');
                    res.redirect('/');
                    // res.send('User registered successfully');
                }
            });
        } else {
            res.send('Passwords do not match');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
})