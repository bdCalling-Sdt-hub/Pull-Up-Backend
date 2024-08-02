const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (file.fieldname === 'image') {
            cb(null, './public/uploads/users');
        }
        else if (file.fieldname === 'NIDF' || file.fieldname === 'NIDB') {
            cb(null, './public/uploads/nid');
        }
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname
            .replace(fileExt, '')
            .toLowerCase()
            .split(' ')
            .join('-') + '-' + Date.now();
        cb(null, fileName + fileExt);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG and PNG formats are allowed!'));
    }
};

const uploadFiles = multer({
    storage: storage,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
        files: 3 // Only two files allowed
    },
    fileFilter: fileFilter,
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'NIDF', maxCount: 1 },
    { name: 'NIDB', maxCount: 1 }
]);

module.exports = { uploadFiles };
