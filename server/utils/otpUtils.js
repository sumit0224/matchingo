const bcrypt = require('bcryptjs');

// Generate 4-digit OTP
const generateOTP = () => {
    if (process.env.NODE_ENV === 'production') {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    return '1234'; // Dev mode
};

// Hash OTP
const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

// Verify OTP
const verifyOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP
};
