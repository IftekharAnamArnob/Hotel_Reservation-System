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
app.use('/css', express.static(__dirname + '/public/css/'));
app.use('/images', express.static(__dirname + '/public/images/'));
// app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})