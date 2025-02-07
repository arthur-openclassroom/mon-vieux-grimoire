const jwt = require('jsonwebtoken');
const _const = require('../_const');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, _const.JWT_KEY);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }
};