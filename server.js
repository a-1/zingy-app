var express = require('express');
var compress = require('compression');
var path = require('path');
var app = express();
var dirPath;


app.use(compress());

// Force HTTPS on Heroku
if (process.env.NODE_ENV === 'staging') {

    dirPath = path.join(__dirname, '/dist');
    app.use(express.static(dirPath));
    app.use('/*', function (req, res) {
        res.sendFile(dirPath + '/index.html');
    });

    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });

} else {

    dirPath = path.join(__dirname, '/build');
    app.use(express.static(dirPath));
    app.use('/*', function (req, res) {
        res.sendFile(dirPath + '/index.html');
    });
}

app.listen(process.env.PORT || 9000);