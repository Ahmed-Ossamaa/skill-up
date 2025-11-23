const multer = require('multer');
const path = require('path');

// File filter
const fileFilterFactory = (allowedTypes) => {
    return (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedTypes.includes(ext)) {
            return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
        cb(null, true);
    };
};

// mem storage
const storage = multer.memoryStorage();

//Upload types
const uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: fileFilterFactory(['.png', '.jpg', '.jpeg'])
});

const uploadThumbnail = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilterFactory(['.jpg', '.jpeg', '.png', '.webp'])
});

const uploadVideo = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
    fileFilter: fileFilterFactory(['.mp4', '.mov', '.mkv', '.webm'])
});

const uploadResource = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: fileFilterFactory(['.pdf', '.pptx'])
});

// general upload (if needed later)
const upload = multer({ storage });

module.exports = {
    upload,
    uploadAvatar,
    uploadThumbnail,
    uploadVideo,
    uploadResource
};
