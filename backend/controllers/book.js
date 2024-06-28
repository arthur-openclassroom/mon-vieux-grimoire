const Book = require('../models/book');

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.createBook = async (req, res, next) => {

    const { filename } = req.file;

    const link = `${req.protocol}://${req.get('host')}/images/${filename}`;

    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: link
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Book successfully created' }))
        .catch(error => res.status(400).json({ error }));
};
exports.getBookById = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id }).then((book) => {
        if (book.userId != req.auth.userId)
            res.status(401).json({ message: 'Unauthorized request' });
        else {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id }).then(
                () => {
                    res.status(201).json({
                        message: 'Book updated successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
        }
    });
};

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id }).then(
        () => {
            res.status(200).json({
                message: 'Deleted!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.rateBook = (req, res, next) => {
    const rating = req.body.rating;
    if (rating < 1 || rating > 5) {
        res.status(400).json({
            message: 'Invalid grade'
        });
        return;
    }
    Book.findOne({ _id: req.params.id }).then((book) => {
        const ratings = book.ratings;
        const index = ratings.findIndex(rating => rating.userId === req.auth.userId);
        if (index !== -1)
            return res.status(400).json({ message: 'You have already rated this book' });
        ratings.push({ userId: req.auth.userId, grade: rating });
        const sum = ratings.reduce((acc, rating) => acc + rating.grade, 0);
        const averageRating = (sum / ratings.length).toFixed(2);
        const updateBookParams = { ratings: ratings, averageRating: averageRating };
        Book.updateOne({ _id: req.params.id }, updateBookParams).then(
            () => {
                book.averageRating = averageRating;
                res.status(201).json(
                    book
                );
            }
        ).catch(
            (error) => {
                res.status(400).json({
                    error: error
                });
            }
        );
    });
};

exports.bestrating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3).then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};