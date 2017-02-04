var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequalize;

if (env === 'production') {
    sequalize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    })
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {
    todo: sequelize.import(__dirname + '/models/todo.js'),
    sequelize: sequelize,
    Sequelize: Sequelize
};

module.exports = db;