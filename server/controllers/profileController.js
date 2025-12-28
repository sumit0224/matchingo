// I will switch to create a new file instead of replacing.
// req.user.id should be available if we use auth middleware (need to implement verifyToken middleware)
// For now, assuming mobileNumber is passed or we verify token
const { id } = req.user; // We'll need middleware for this
const { firstName, lastName, dateOfBirth, gender, relationshipGoals, lifestyle } = req.body;

try {
    const query = `
            UPDATE users 
            SET 
                first_name = $1,
                last_name = $2,
                date_of_birth = $3,
                gender = $4,
                relationship_goals = $5,
                lifestyle = $6,
                is_profile_completed = TRUE
            WHERE id = $7
            RETURNING *;
        `;

    const values = [firstName, lastName, dateOfBirth, gender, relationshipGoals, JSON.stringify(lifestyle), id];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        message: 'Profile updated successfully',
        user: {
            id: result.rows[0].id,
            mobileNumber: result.rows[0].mobile_number,
            isProfileCompleted: result.rows[0].is_profile_completed,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name
        }
    });

} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error update profile' });
}


module.exports = { updateProfile };
