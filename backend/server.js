//EXPRESS:Express bietet uns eine unkomplizierte Middleware für die Weiterverwaltung von http-Anfragen an die Datenbank und zurück.
//server.js wird benutzt um Express zu benutzen

//erstellen Variable um express zu initilaisieren

//Starte backend mit ------>>>> node server.js
//Models ordner ist posts.js

//Nodemon Package wurde mit npm install --save-dev
// nodemon hinzugefügt zur package.json fügen noch das in die package.json ---> "watch": "nodemon ./server.js", und runnen backend mit npm run watch

//Installieren Moongose für DB Connection mit npm install mongoose --save
//Mongoose stellt eine einfach zu verwendende Schnittstelle zwischen Node.js und MongoDB bereit.
// Die MongoDB benötigen wir aber trotzdem (wir könnten jedoch auch eine Cloud von MongoDB oder z.B. mlab.com verwenden).
// Bevor wir uns mit der MongoDB verbinden, erstellen wir zunächst noch eine Datenbank.
//erstellen eine .env-File zur Connection und fügen das hier in dei server.js rein und verwednen  das .env Package npm install dotenv --save


const express = require('express');
const routes = require('./routes');
//const mongoose=  require('dotenv').config();//connection der .env bzw. Mongodb
const mongoose = require('mongoose');
require('dotenv').config();//connection der .env bzw. Mongodb
const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/', routes);

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});

// connect to mongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected to DB');
});