var express = require('express');
var app = express();
const PORT = 3000;

var middleware = {
    requireAuthentication: function (req, res, next) {
        console.log('Private route hit!');
        next();
    },
    logger: function (req, res, next) {
        console.log('Request: ',
            req.method,
            req.originalUrl,
            'on',
            new Date().toString());
        next();
    }
};

app.use(middleware.logger);

app.get('/about', middleware.requireAuthentication, function (req, res) {
    res.send('<h1>About Us</h1>');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function () {
    console.log('Express server started on port', PORT);
});