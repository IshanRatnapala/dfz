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
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var filteredTodo = _.findWhere(todos, {id: todoId});

    if (filteredTodo) {
        res.json(filteredTodo);
    } else {
        res.status(404).send();
    }
});

// POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) ||
        !_.isString(body.description) ||
        !body.description.trim().length) {
        return res.status(400).send();
    }

    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    res.json(todos);
});

app.use(express.static(__dirname + '/public'));
app.listen(PORT, function () {
    console.log('Express server started on port', PORT);
});