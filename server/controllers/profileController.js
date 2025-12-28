const db = require('../config/db');

const updateProfile = async (req, res) => {
    // req.user is set by authMiddleware
    const { id } = req.user;
    const { firstName, lastName, dateOfBirth, gender, relationshipGoals, lifestyle } = req.body;

    try {
        const query = `
            UPDATE users 
            SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                date_of_birth = COALESCE($3, date_of_birth),
                gender = COALESCE($4, gender),
                relationship_goals = COALESCE($5, relationship_goals),
                lifestyle = COALESCE($6, lifestyle),
                is_profile_completed = TRUE
            WHERE id = $7
            RETURNING *;
        `;

        // Use proper JSON stringify for JSONB column if needed, or rely on pg driver
        const lifestyleJson = lifestyle ? JSON.stringify(lifestyle) : null;

        const values = [firstName, lastName, dateOfBirth, gender, relationshipGoals, lifestyleJson, id];

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                mobileNumber: user.mobile_number,
                isProfileCompleted: user.is_profile_completed,
                firstName: user.first_name,
                lastName: user.last_name,
                lifestyle: user.lifestyle
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error update profile' });
    }
};

module.exports = { updateProfile };
