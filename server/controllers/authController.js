const db = require('../config/db');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpUtils');
const { generateToken } = require('../utils/jwtUtils');

const isValidIndianMobile = (mobile) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
};

// Send OTP
const sendOtp = async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber || !isValidIndianMobile(mobileNumber)) {
        return res.status(400).json({ error: 'Invalid Indian mobile number' });
    }

    try {
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Upsert OTP (Update if exists, Insert if new)
        // Note: In Postgres, ON CONFLICT requires a constraint name or column list. 
        // We assumed mobile_number is PK or UNIQUE.
        await db.query(
            `INSERT INTO otps (mobile_number, otp_hash, expires_at) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (mobile_number) 
             DO UPDATE SET otp_hash = $2, expires_at = $3`,
            [mobileNumber, hashedOtp, expiresAt]
        );

        if (process.env.NODE_ENV === 'production') {
            // Integrate SMS provider here (Mock function)
            console.log(`[SMS PROVIDER] Sending OTP ${otp} to ${mobileNumber}`);
            return res.json({ message: 'OTP sent successfully' });
        } else {
            return res.json({ message: 'OTP sent successfully', otp }); // Return OTP in Dev
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    try {
        // Fetch OTP record
        const otpResult = await db.query('SELECT * FROM otps WHERE mobile_number = $1', [mobileNumber]);

        if (otpResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid OTP or expired' });
        }

        const otpRecord = otpResult.rows[0];

        // Check Expiry
        if (new Date() > new Date(otpRecord.expires_at)) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Verify Hash
        const isValid = await verifyOTP(otp, otpRecord.otp_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check if User exists
        const userResult = await db.query('SELECT * FROM users WHERE mobile_number = $1', [mobileNumber]);

        let user;
        let isNewUser = false;

        if (userResult.rows.length > 0) {
            user = userResult.rows[0];
        } else {
            // Create New User
            const newUserReq = await db.query(
                'INSERT INTO users (mobile_number) VALUES ($1) RETURNING *',
                [mobileNumber]
            );
            user = newUserReq.rows[0];
            isNewUser = true;
        }

        // Generate Token
        const token = generateToken(user.id, user.mobile_number);

        // Delete used OTP (Optional but good practice)
        await db.query('DELETE FROM otps WHERE mobile_number = $1', [mobileNumber]);

        return res.json({
            token,
            user: {
                id: user.id,
                mobileNumber: user.mobile_number,
                isProfileCompleted: user.is_profile_completed
            },
            redirect: isNewUser || !user.is_profile_completed ? 'ProfileCompletion' : 'Home'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    sendOtp,
    verifyOtp
};
