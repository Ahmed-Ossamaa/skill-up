const cloudinary = require('../config/cloudinary');
const { PassThrough } = require('stream');

// upload buffer to cloudinary using PassThrough
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto', options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType, ...options },
            (err, result) => (err ? reject(err) : resolve(result))
        );

        const pass = new PassThrough();
        pass.end(fileBuffer);
        pass.pipe(uploadStream);
    });
};

// simple delete by publicId
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
