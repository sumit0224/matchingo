const db = require('../config/db');

// Send Message
const sendMessage = async (req, res) => {
    const { id } = req.user; // Sender
    const { matchId, content } = req.body;

    try {
        // 1. Verify user is part of the match
        const matchCheck = await db.query(
            'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [matchId, id]
        );

        if (matchCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to chat in this match' });
        }

        // 2. Insert Message
        const query = `
            INSERT INTO messages (match_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [matchId, id, content]);

        // TODO: Emit Socket Event (io.to(room).emit('new_message', ...))

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error sending message' });
    }
};

// Get Messages
const getMessages = async (req, res) => {
    const { id } = req.user;
    const { matchId } = req.params;

    try {
        // 1. Verify access
        const matchCheck = await db.query(
            'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [matchId, id]
        );

        if (matchCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // 2. Fetch messages
        const query = `
            SELECT * FROM messages 
            WHERE match_id = $1 
            ORDER BY created_at ASC
        `;
        const result = await db.query(query, [matchId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
};

// Get All Matches for User (Putting this in chat/match controller)
const getMatches = async (req, res) => {
    const { id } = req.user;

    try {
        // Join with users table to get other user's details
        const query = `
            SELECT 
                m.id as match_id, m.created_at,
                CASE 
                    WHEN m.user1_id = $1 THEN u2.first_name 
                    ELSE u1.first_name 
                END as name,
                CASE 
                    WHEN m.user1_id = $1 THEN u2.id 
                    ELSE u1.id 
                END as other_user_id,
                -- Get Profile Pic
                (
                    SELECT url FROM user_photos 
                    WHERE user_id = (CASE WHEN m.user1_id = $1 THEN u2.id ELSE u1.id END) 
                    AND is_primary = TRUE LIMIT 1
                ) as photo_url,
                -- Last Message
                (
                    SELECT content FROM messages 
                    WHERE match_id = m.id 
                    ORDER BY created_at DESC LIMIT 1
                ) as last_message
            FROM matches m
            JOIN users u1 ON m.user1_id = u1.id
            JOIN users u2 ON m.user2_id = u2.id
            WHERE m.user1_id = $1 OR m.user2_id = $1
            ORDER BY m.created_at DESC;
        `;

        const result = await db.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching matches' });
    }
};

module.exports = { sendMessage, getMessages, getMatches };
