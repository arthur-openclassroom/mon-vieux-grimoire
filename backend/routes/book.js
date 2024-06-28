const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtl = require('../controllers/book');

router.get('/', bookCtl.getAllBooks);
router.post('/', auth, multer.upload.single("image"), multer.optimize, bookCtl.createBook);
router.get('/bestrating', bookCtl.bestrating);
router.get('/:id', bookCtl.getBookById);
router.put('/:id', auth, multer.upload.single("image"), multer.optimize, bookCtl.updateBook);
router.delete('/:id', auth, bookCtl.deleteBook);
router.post('/:id/rating', auth, bookCtl.rateBook);

module.exports = router;