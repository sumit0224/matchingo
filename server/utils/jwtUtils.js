const jwt = require('jsonwebtoken');

const generateToken = (userId, mobileNumber) => {
    return jwt.sign(
        { id: userId, mobileNumber },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = {
    generateToken
};
