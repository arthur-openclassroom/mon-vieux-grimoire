const multer = require('multer');
const sharp = require("sharp");
const fs = require("fs");
const storage = multer.memoryStorage();

const optimize = async (req, res, next) => {
    if (!req.file)
        return next();
    fs.access("./images", (error) => {
        if (error) {
            fs.mkdirSync("./images");
        }
    });
    const { buffer, originalname } = req.file;

    const timestamp = new Date().toISOString();
    const newName = `${timestamp}-${originalname.split(".")[0]}.webp`;

    await sharp(buffer)
        .resize({ width: 206, height: 260, fit: "contain", background: { r: 255, g: 255, b: 255 } })
        .webp({ quality: 50 })
        .toFile("./images/" + newName);
    req.file.filename = newName;
    next();
};

module.exports = {
    upload: multer({ storage: storage }),
    storage: multer.memoryStorage(),
    optimize: optimize
};

