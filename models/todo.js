module.exports= function (sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true
            }
        }
    }, {
        hooks: {
            beforeValidate: function (todo, options) {
                if (typeof todo.description === 'string') {
                    todo.description = todo.description.trim();
                }
            }
        }
    });
};