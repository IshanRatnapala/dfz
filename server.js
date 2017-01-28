var express = require('express');
var middleware = require('./middleware');
var app = express();
const PORT = 3000;

app.use(middleware.logger);

app.get('/about', middleware.requireAuthentication, function (req, res) {
    res.send('<h1>About Us</h1>');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function () {
    console.log('Express server started on port', PORT);
});