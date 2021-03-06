var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware')(db);
var bcrypt = require('bcrypt-nodejs');

var app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(middleware.logger);

// GET /todos
app.get('/todos', middleware.requireAuth, function (req, res) {
    var query = req.query;
    var filters = {
        userId: req.user.get('id')
    };

    if (query.hasOwnProperty('completed')) {
        if (query.completed === 'true') {
            filters.completed = true;
        } else if (query.completed === 'false') {
            filters.completed = false;
        }
    }
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        filters.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: filters
    }).then(function (todos) {
        res.json(todos);
    }).catch(function (e) {
        res.status(500).json(e);
    });
});
// GET /todos/:id
app.get('/todos/:id', middleware.requireAuth, function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    })
        .then(
            function (todo) {
                if (!!todo) {
                    res.json(todo);
                } else {
                    res.status(404).send();
                }
            },
            function (e) {
                res.status(500).send();
            });
});
// POST /todos
app.post('/todos', middleware.requireAuth, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    body.description = body.description;
    db.todo.create(body).then(
        function (todo) {
            req.user.addTodo(todo)
                .then(function () {
                    return todo.reload();
                })
                .then(function (todo) {
                    res.json(todo);
                })
        },
        function (e) {
            res.send(400).json(e);
        });
});
// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuth, function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(
        function (rowsDeleted) {
            if (!!rowsDeleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: "No todo with id" });
            }
        },
        function () {
            res.status(500).send();
        });
});
// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuth, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    })
        .then(
            function (todo) {
                if (todo) {
                    todo.update(attributes)
                        .then(
                            function (todo) {
                                res.json(todo);
                            },
                            function (e) {
                                res.status(400).json(e);
                            });
                } else {
                    res.status(404).send();
                }
            }, function () {
                res.status(500).send();
            });
});

//POST /user
app.post('/user', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(
        function (user) {
            res.json(user.toPublicJSON());
        },
        function (e) {
            res.status(400).json(e);
        }
    )
});

// POST /user/login
app.post('/user/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body)
        .then(function (user) {
            var token = user.generateToken('authentication');
            userInstance = user;
            return db.token.create({
                token: token
            });
        })
        .then(function (token) {
            res.header('Auth', token.get('token')).json(userInstance.toPublicJSON());
        })
        .catch(function () {
            res.status(401).send();
        });
});

// DELETE /user/login
app.delete('/user/login', middleware.requireAuth, function (req, res) {
    req.token.destroy().then(function () {
        res.status(204).send();
    }).catch(function () {
        res.status(500).send();
    })
})

app.use(express.static(__dirname + '/public'));

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express server started on port', PORT);
    });
});
