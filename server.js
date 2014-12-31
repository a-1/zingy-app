var express = require('express');
var path = require('path');
var app = express();

var dirPath = path.join(__dirname, '/build');

app.use(express.static(dirPath));

app.use('/*', function (req, res) {
    res.sendFile(dirPath + '/index.html');
});

app.listen(process.env.PORT || 9000);