//EXPRESS:Express bietet uns eine unkomplizierte Middleware für die Weiterverwaltung von http-Anfragen an die Datenbank und zurück.
//server.js wird benutzt um Express zu benutzen

//erstellen Variable um express zu initilaisieren

//Starte backend mit ------>>>> node server.js oder npm run watch
//Models ordner ist posts.js

//Nodemon Package wurde mit npm install --save-dev
// nodemon hinzugefügt zur package.json fügen noch das in die package.json ---> "watch": "nodemon ./server.js", und runnen backend mit npm run watch

//Installieren Moongose für DB Connection mit npm install mongoose --save
//Mongoose stellt eine einfach zu verwendende Schnittstelle zwischen Node.js und MongoDB bereit.
// Die MongoDB benötigen wir aber trotzdem (wir könnten jedoch auch eine Cloud von MongoDB oder z.B. mlab.com verwenden).
// Bevor wir uns mit der MongoDB verbinden, erstellen wir zunächst noch eine Datenbank.
//erstellen eine .env-File zur Connection und fügen das hier in dei server.js rein und verwednen  das .env Package npm install dotenv --save

//npm install multer multer-gridfs-storage gridfs-stream installiere multer
//Multer = nodejs Middleware https://www.npmjs.com/package/multer


//Die Same Origin Policy (SOP) ist ein Sicherheitskonzept, das clientseitig Skriptsprachen (also z.B. JavaScript oder CSS)
// untersagt, Ressourcen aus verschiedenen Herkunften zu verwenden, also von verschiedenen Servern.
// Dadurch soll verhindert werden, dass fremde Skripte in die bestehende Client-Server-Kommunikation eingeschleust werden.
// Gleiche Herkunft (origin) bedeutet, dass das gleiche Protokoll (z.B. http oder https),
// von der gleichen Domain (z.B. localhost oder htw-berlin) sowie dem gleichen Port (z.B. 80 oder 4200) verwendet werden.
//Installation mit npm install cors
//INFOS zur Cors:https://expressjs.com/en/resources/middleware/cors.html

const express = require('express');
const cors = require('cors');
const postsRoutes = require('./routes/posts.routes');
const uploadRoutes = require('./routes/upload.routes');
const downloadRoute = require('./routes/downloads.routes');
const deleteRoute = require('./routes/delete.routes');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

//Routen
/*app.use('/posts', postsRoutes);
app.use('/image', uploadRoutes);
app.use('/download', downloadRoute);
app.use('/delete', deleteRoute);*/
app.use(express.json());
app.use(cors());
app.use('/posts', postsRoutes)

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
/* die folgende Verbindung brauchen wir gar nicht, wird jeweils bei Bedarf erzeugt (mongoose) */
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => console.log('connected to DB')
    ).catch(
    err => console.error(err, 'conncetion error')
)

const db = mongoose.connection;