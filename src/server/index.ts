'use strict';

const express = require('express');
const path = require('path');

const basePath: string = path.join(__dirname, '..');
const publicContentPath: string = path.join(basePath, 'public');
const app = express();

app.set('port', (process.env.PORT || 8080));

app.use(express.static(publicContentPath));

app.get('/', function (req, res) {
    res.send('<p>Hello World?</p>');
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port')); // tslint:disable-line no-console
});
