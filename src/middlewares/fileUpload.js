const multer = require("multer");
const path = require("path");

module.exports = function (UPLOADS_FOLDER) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, UPLOADS_FOLDER); // Use the provided destination folder
        },
        filename: (req, file, cb) => {
            const fileExt = path.extname(file.originalname);
            const filename =
                file.originalname
                    .replace(fileExt, "")
                    .toLocaleLowerCase()
                    .split(" ")
                    .join("-") +
                "-" +
                Date.now();

            cb(null, filename + fileExt);
        },
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 2000000, // 2MB
        },
        fileFilter: (req, file, cb) => {
            if (
                file.mimetype == "image/jpg" ||
                file.mimetype == "image/png" ||
                file.mimetype == "image/jpeg"
            ) {
                cb(null, true);

            } else {
                cb(new Error("Only jpg, png, jpeg format allowed!"));
            }
        },
    });

    return upload; // Return the configured multer upload middleware
};