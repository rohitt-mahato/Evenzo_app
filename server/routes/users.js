const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, uploadProfilePicture, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename(req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);

// Admin routes
router.get('/all', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
