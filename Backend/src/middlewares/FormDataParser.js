
const parseFormDataArrays = (req, res, next) => {
   
    const arrayFields = ['resources']; 
    
    arrayFields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
            try {
                // Attempt to parse the string back into a JS object/array
                req.body[field] = JSON.parse(req.body[field]);
            } catch (e) {
                console.error(`Failed to parse JSON string for field: ${field}`, req.body[field]);
            }
        }
    });

    next();
};

module.exports = parseFormDataArrays;