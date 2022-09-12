//Diese Middleware nutzen wir nun für den POST-Request des Bildes
/*
* Multer
*  is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
*
*
 */
const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', upload.single('file'), (req, res) => {
    // req.file is the `file` file
    if (req.file === undefined) {

        return res.send({
            "message": "no file selected"
        });
    } else {
        console.log('req.file', req.file);
        const imgUrl = `http://localhost:4000/download/${req.file.filename}`;
        return res.status(201).send({
            url: imgUrl
        });
    }
})

module.exports = router;