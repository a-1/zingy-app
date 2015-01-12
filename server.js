var express = require('express');
var path = require('path');
var app = express();

// Force HTTPS on Heroku
if (process.env.NODE_ENV === 'staging') {

    // var dirPath = path.join(__dirname, '../staging');
    app.use(express.static(__dirname + '/staging'));
    app.use('/*', function (req, res) {
        res.sendFile(__dirname + '/staging/index.html');
    });


    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });

} else {
    var dirPath = path.join(__dirname, '/build');
    app.use(express.static(dirPath));
    app.use('/*', function (req, res) {
        res.sendFile(dirPath + '/index.html');
    });
}

app.listen(process.env.PORT || 9000);