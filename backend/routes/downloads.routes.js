/**
 * GridFsBucket ist eine Klasse aus der Node.js MongoDB-Modules. Könnte man auch als upload verwenden
 * Route zum Downloaden von Bilder
 * Binden es dann in den Server.js Datei ein und prüfen es in Postmann mit unter GET http://localhost:3000/download/:filename
 */
const express = require('express');
const mongoose = require('mongoose');
const Grid = require("gridfs-stream");
const multer = require('multer');
const router = express.Router();
const { GridFsStorage } = require('multer-gridfs-storage')
const { MongoClient } = require('mongodb');
require('dotenv').config();

const connect = mongoose.createConnection(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "posts";

let gfs, gfsb;
connect.once('open', () => {
    // initialize stream
    gfsb = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "posts"
    });

    gfs = Grid(connect.db, mongoose.mongo);
    // gfs.collection('file');
});

router.get('/show/:filename', async(req, res) => {
    try {
        const cursor = await gfs.collection('posts').find({ filename: req.params.filename });
        cursor.forEach(doc => {
            console.log('doc', doc);
            const id = doc._id.valueOf();
            console.log('doc._id', id);
            gfsb.openDownloadStream(doc._id).pipe(res);
        })
    } catch (error) {//Fehlermeldung
        console.log('error', error);
        res.send("not found");
    }
});

router.get('/send/:filename', async(req, res) => {

    let fileName = req.params.filename;
//1.Verbinden mit DB
    MongoClient.connect(process.env.DB_CONNECTION, (err, client) => {

        if(err){//Fehlermeldung
            return res.send({title: 'Uploaded Error', message: 'MongoClient Connection error', error: err.errMsg});
        }
    //2.Erstellen 3 Variable eine für die Datenbank,die posts.files-Collection und die posts.chunks-Collection
        const db = client.db(dbName);
        const collection = db.collection('posts.files');
        const collectionChunks = db.collection('posts.chunks');
        //3.Ermitteln den Dateinamen und die ID
        collection.find({filename: fileName}).toArray( (err, docs) => {
            if(err){//Fehlermeldung
                return res.send({title: 'File error', message: 'Error finding file', error: err.errMsg});
            }
        //Fehlermeldung falls nicht klappt
            if(!docs || docs.length === 0){
                return res.send({title: 'Download Error', message: 'No file found'});
            } else {
                //Retrieving the chunks from the db
                console.log('docs[0]._id', docs[0]._id)
                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {
                    if(err){
                        return res.send({title: 'Download Error', message: 'Error retrieving chunks', error: err.errmsg});
                    }
                    if(!chunks || chunks.length === 0){
                        //No data found
                        return res.send({title: 'Download Error', message: 'No data found'});
                    }
                    //console.log('chunks', chunks)
                    //Speichern bzw. hinzufügen der Chunks
                    //Mit JavaScript-Funktion toString('base64) wandeln wir diese Daten in einen String um und speichern die String in das Array fileData.
                    //Append Chunks
                    let fileData = [];
                    for(let chunk of chunks){
                        console.log('chunk', chunk)
                        //This is in Binary JSON or BSON format, which is stored
                        //in fileData array in base64 endocoded string format
                        fileData.push(chunk.data.toString('base64'));
                    }

                    //Display the chunks using the data URI format
                    let finalFile = 'data:' + docs[0].contentType + ';base64,' + fileData.join('data:image/jpeg;base64,');
                    // console.log('finalFile', finalFile)
                    res.send({title: 'Image File', message: 'Image loaded from MongoDB GridFS', imgurl: finalFile});
                }) // toArray
            } // else
        }) // toArray
    }) // connect
}) // get

module.exports = router;