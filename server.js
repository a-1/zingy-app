var express = require('express');
var compress = require('compression');
var path = require('path');
var app = express();

//dirPath
var dirPath = path.join(__dirname, '/build');

//to gzip
app.use(compress());

// Force HTTPS on Heroku
if (process.env.NODE_ENV === 'production') {
    dirPath = path.join(__dirname, '/dist');
}

//expose static files
app.use(express.static(dirPath));
app.use('/*', function (req, res) {
    res.sendFile(dirPath + '/index.html');
});

app.listen(process.env.PORT || 9000);