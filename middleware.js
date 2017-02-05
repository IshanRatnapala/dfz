module.exports = function (db) {
    return {
        requireAuth: function (req, res, next) {
            var token = req.get('Auth');

            db.user.findByToken(token).then(
                function (user) {
                    req.user = user;
                    next();
                },
                function () {
                    res.status(401).send();
                });
        },
        logger: function (req, res, next) {
            console.log('Request: ',
                req.method,
                req.originalUrl,
                'on',
                new Date().toString());
            next();
        }
    }
};