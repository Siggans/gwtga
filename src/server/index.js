'use strict';
var express = require('express');
var path = require('path');
var basePath = path.join(__dirname, '..');
var publicContentPath = path.join(basePath, 'public');
var app = express();
app.set('port', (process.env.PORT || 8080));
app.use(express.static(publicContentPath));
app.get('/', function (req, res) {
    res.send('<p>Hello World?</p>');
});
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port')); // tslint:disable-line no-console
});
