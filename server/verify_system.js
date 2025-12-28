const http = require('http');

const postRequest = (path, body) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: JSON.parse(responseData || '{}') });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('--- Testing Send OTP ---');
        const sendRes = await postRequest('/auth/send-otp', { mobileNumber: '9988776655' });
        console.log('Status:', sendRes.statusCode);
        console.log('Body:', sendRes.body);

        if (sendRes.statusCode !== 200) {
            console.error('Failed to send OTP. Check Database connection.');
            return;
        }

        const otp = sendRes.body.otp;
        if (!otp) {
            console.log('No OTP returned (Production Mode?). Using 1234 if stuck.');
        } else {
            console.log('Got OTP:', otp);
        }

        const otpToUse = otp || '1234';

        console.log('\n--- Testing Verify OTP ---');
        const verifyRes = await postRequest('/auth/verify-otp', { mobileNumber: '9988776655', otp: otpToUse });
        console.log('Status:', verifyRes.statusCode);
        console.log('Body:', verifyRes.body);

    } catch (err) {
        console.error('Test failed:', err.message);
    }
};

runTest();
