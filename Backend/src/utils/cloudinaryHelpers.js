const cloudinary = require('../config/cloudinary');
const { PassThrough } = require('stream');

// upload buffer to cloudinary using PassThrough
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto', options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType, ...options },
            (err, result) => {
                if (err) return reject(err);

                resolve({
                    secure_url: result.secure_url, 
                    publicId: result.public_id,    
                    format: result.format,
                    resourceType: result.resource_type,
                    duration: result.duration     
                });
            }

        );

        const pass = new PassThrough();
        pass.end(fileBuffer);
        pass.pipe(uploadStream);
    });
};

// delete by publicId
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
