var cryptojs = require('crypto-js');

module.exports = function (db) {
    return {
        requireAuth: function (req, res, next) {
            var token = req.get('Auth') || '';

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function (tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                req.token = tokenInstance;
                return db.user.findByToken(token);

            }).then(function (user) {
                req.user = user;
                next();
            }).catch(function () {
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