var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Authorization header ("Bearer token") not found' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'f9555b44c4b223960022e84055e11bfd2c07f7c6f13a5edee2b1d65a865ed4c05c02049672a4e4ff8e2a567b55f8a07b2357d661f482790c7947ad1e0be4db94', (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: true, message: 'Expired JWT token' });
      } else {
        return res.status(401).json({ error: true, message: 'Invalid JWT token' });
      }
    }
    req.user = decoded;
    next();
  });
}

// POST route to add a comment
// Validate rating format (1 to 5 with up to one decimal place)
function isValidRating(rating) {
  return /^([1-4](\.\d{1})?|5(\.0)?)$/.test(rating);
}

// POST route to add a comment
router.post('/volcanoes/:id/comments', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  // Validate request body
  if (!comment || rating == null || isNaN(rating) || !isValidRating(rating)) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete or invalid, comment and rating (1-5 with up to one decimal place) are required.'
    });
  }

  try {
    await req.db('comments').insert({ volcano_id: id, user_id: req.user.id, comment, rating });
    res.status(201).send({ message: 'Comment added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'There was an error adding the comment' });
  }
});

// GET route to retrieve all comments
router.get('/volcanoes/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await req.db('comments')
      .select('comments.user_id', 'comments.id', 'comments.comment', 'comments.rating', 'comments.created_at')
      .join('users', 'comments.user_id', 'users.id')
      .where({ volcano_id: id });
    if (comments.length === 0) {
      return res.status(404).json({ error: true, message: `No comments found for volcano with ID: ${id}` });
    }
    res.status(200).send(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'There was an error retrieving the comments' });
  }
});

// GET route to retrieve the average rating
router.get('/volcanoes/:id/ratings', async (req, res) => {
  const { id } = req.params;
  try {
    const averageRating = await req.db('comments')
      .where({ volcano_id: id })
      .avg('rating as avg_rating');
    if (averageRating.length === 0 || !averageRating[0].avg_rating) {
      return res.status(404).json({ error: true, message: `No ratings found for volcano with ID: ${id}` });
    }
    res.status(200).send({ averageRating: parseFloat(averageRating[0].avg_rating).toFixed(1) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'There was an error retrieving the average rating' });
  }
});

module.exports = router;
