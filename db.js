var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
});

var db = {
    todo: sequelize.import(__dirname + '/models/todo.js'),
    sequelize: sequelize,
    Sequelize: Sequelize
};

module.exports = db;