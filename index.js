var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./app/routes/routes')

// initial setting
var app = express();
app.set('views', path.join(__dirname, '/app/views'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// session control
app.use(session({
    secret: 'secretMessage',
    cookie: {maxAge: 600 * 1000}, // 10 minutes until expire
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '/public'))) // static contents

// routes
app.use('/', routes);

app.listen(3000, function () {
    console.log('listening on port 3000\n');
})