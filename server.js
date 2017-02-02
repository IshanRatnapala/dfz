var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var middleware = require('./middleware');
var app = express();
const PORT = process.env.PORT || 3000;

var todoNextId = 1;
var todos = [];
// var todos = [
//     {
//         id: 1,
//         description: "Eat chocos",
//         completed: false
//     },
//     {
//         id: 2,
//         description: "Go to the market",
//         completed: false
//     },
//     {
//         id: 3,
//         description: "Eat lunch",
//         completed: true
//     }
// ];
app.use(bodyParser.json());
app.use(middleware.logger);

// GET /todos
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') &&
        queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, { completed: true });
    } else if (queryParams.hasOwnProperty('completed') &&
        queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, { completed: false });
    }

    if (queryParams.hasOwnProperty('q') &&
        queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (item) {
            return item.description.toLowerCase()
                    .indexOf(queryParams.q.toLowerCase()) !== -1;
        });
    }

    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var filteredTodo = _.findWhere(todos, { id: todoId });

    if (filteredTodo) {
        res.json(filteredTodo);
    } else {
        res.status(404).send();
    }
});

// POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || !body.description.trim().length) {
        return res.status(400).send();
    }

    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    res.json(todos);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var filteredTodo = _.findWhere(todos, { id: todoId });

    if (filteredTodo) {
        todos = _.without(todos, filteredTodo);
        res.send(todos);
    } else {
        res.status(404).json({ "error": "Todo not found." });
    }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var filteredTodo = _.findWhere(todos, { id: todoId });
    var validAttributes = {};

    if (!filteredTodo) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') &&
        _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    } else {

    }

    if (body.hasOwnProperty('description') &&
        _.isString(body.description) &&
        body.description.trim().length) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    } else {

    }

    _.extend(filteredTodo, validAttributes);
    res.json(todos);
});

app.use(express.static(__dirname + '/public'));
app.listen(PORT, function () {
    console.log('Express server started on port', PORT);
});