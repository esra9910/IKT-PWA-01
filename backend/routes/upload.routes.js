//Diese Middleware nutzen wir nun für den POST-Request des Bildes
/*
* Multer
*  is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
*
*
 */
const multer = require("multer");
const {
    GridFsStorage
} = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.DB,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            console.log('file.mimetype === -1')
            return `${Date.now()}-jf-${file.originalname}`;
        }
        console.log('store');
        return {
            bucketName: 'posts',
            filename: `${Date.now()}-jf-${file.originalname}`,
        };
    },
});

module.exports = multer({ storage });