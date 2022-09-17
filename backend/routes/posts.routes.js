//Noch lässt sich unser Programm aber nicht ausführen.
// Wir benötigen im Projektordner noch eine Datei posts.routes.js.
// Diese wird nämlich in der server.js bereits in Zeile 2 eingebunden und in Zeile 8 verwendet.
//----------------------------------------------------------Wichtig-----------------------------
//Middleware, die die Routen verwaltet
// und request-Objekte an die entsprechende Routen weiterleitet und response-Objekte empfängt.
//Brauchen wir express und nutzen es
//Routen werden geändert und eingebunden
//DAtei war routes.js ---> posts.routes.js
//Änderung im Server.js Datei


// eine GET-Anfrage
//router.get('/', async(req, res) => {
//    res.send({ message: "Hello dein Bakend läuft im Pfad / !" });
//});

//module.exports = router;
///Damit wir es für andere Daten verwenden könnten benutzen wir dies für außen verfügbar und nutzbar

//Wir nutzen den express.Router,
// um die Routen zu definieren und können mithilfe des Mongoose-Models auf die MongoDB zugreifen.
/**
 *
 *
 * Für unser Datenmodell sieht die Auteilung der Daten somit wie folgt aus:

 in der posts-Collection speichern wir

 - die _id des Posts,
 - den title eines Posts,
 - die location und
 - die image_id. Die image_id enthält den Dateinamen filename des Bildes.

 in der posts.files-Collection speichern wir (GridFs)

 - die _id der Datei,
 - die length der Datei,
 - die chunkSize,
 - das uploadDate,
 - den filename (siehe in posts die image_id) und den contenType (z.B. image/jpeg)

 in der posts.chunks-Collection speichern wir (GridFs)
 - die _id des Chunks,
 - die files_id (diese entspricht der _id der Datei in der posts.files-Collection),
 - ein n (fortlaufende Nummerierung der Chunks einer Datei beginnend mit 0),
 - die data der Datei (in diesem Chunk)



 ------> Fügen alles zsm von Upload und Download von Bildern und posts-Routes<---------------------


 */
const express = require('express');
const router = express.Router();
const Post = require('../models/posts');//unsere posts wo
const upload = require('../middleware/upload');// für unseren Upload
const mongoose = require('mongoose');

/* ----------------- POST ---------------------------- */

/// POST one post
router.post('/', upload.single('file'), async(req, res) => {
    // req.file is the `file` file
    if (req.file === undefined) {
        return res.send({
            "message": "no file selected"
        });
    } else {
        console.log('req.body', req.body);
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            location: req.body.location,
            image_id: req.file.filename
        })
        await newPost.save();
        return res.send(newPost);
    }
})
// GET all posts
router.get('/', async(req, res) => {

    getAllPosts()
        .then( (posts) => {
            res.send(posts);
        })
        .catch( () => {
            res.status(404);
            res.send({
                error: "Post do not exist!"
            });
        })
});
/* ----------------- GET ---------------------------- */
const connect = mongoose.createConnection(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const collectionFiles = connect.collection('posts.files');//geändert
const collectionChunks = connect.collection('posts.chunks');//geändert


// GET all posts
router.get('/', async(req, res) => {
    const allPosts = await Post.find();
    console.log(allPosts);
    res.send(allPosts);
});

// GET one post via id
router.get('/:id', async(req, res) => {
    getOnePost(req.params.id)
        .then( (post) => {
            console.log('post', post);
            res.send(post);//promise objekt wird zuruckgegeben
        })
        .catch( () => {
            res.status(404);
            res.send({
                error: "Post does not exist!"
            });
        })
});

function getAllPosts() {
    return new Promise( async(resolve, reject) => {
        const sendAllPosts = [];
        const allPosts = await Post.find();
        try {//try
            for(const post of allPosts) {
                console.log('post', post)
                const onePost = await getOnePost(post._id);
                sendAllPosts.push(onePost);
            }
            console.log('sendAllPosts', sendAllPosts)
            resolve(sendAllPosts)
        } catch {//Error
            reject(new Error("Posts do not exist!"));
        }
    });
}
// POST one post via id
function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            // console.log('post.image_id', post.image_id);
            let fileName = post.image_id;

            collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
                // console.log('docs', docs)
                //wird gesucht nach der id
                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {


                    const fileData = [];
                    for(let chunk of chunks)
                    {
                        // console.log('chunk._id', chunk._id)
                        fileData.push(chunk.data.toString('base64'));
                    }

                    let base64file = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                    let getPost = new Post({
                        "title": post.title,
                        "location": post.location,
                        "content": post.content,
                        "image_id": base64file
                    });
                    //console.log('getPost', getPost)
                    resolve(getPost)
                })

            }) // toArray find filename

        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
}

// PATCH (update) one post
router.patch('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })

        if (req.body.title) {
            post.title = req.body.title
        }
        if (req.body.content) {
            post.content = req.body.content
        }

        if (req.body.location) {
            post.location = req.body.location
        }

        if (req.body.image_id) {
            post.image_id = req.body.image_id
        }

        await Post.updateOne({ _id: req.params.id }, post);
        res.send(post)
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});


/* ----------------- DELETE ---------------------------- */


// DELETE one post via id
router.delete('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        let fileName = post.image_id;
        await Post.deleteOne({ _id: req.params.id });
        await collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
            await collectionChunks.deleteMany({files_id : docs[0]._id});
        })
        await collectionFiles.deleteOne({filename: fileName});
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});
module.exports = router ;//Export hinzufügen