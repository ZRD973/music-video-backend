'use strict';
const base = require('../base');

module.exports = app => {
    const { STRING, INTEGER } = app.Sequelize;
  
    const User = app.model.define('sys_user',
      Object.assign(base(app), {
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        account: STRING(64),
        name: STRING(32),
        password: STRING(255),
        sex: STRING(2),
        avatar:STRING(255),
        phone: STRING(32),
        email: STRING(32),
        introduction: STRING(32),
        address: STRING(32),
        delete_flag:INTEGER,
        role:INTEGER
      }));
      User.associate = function () {
        User.hasMany(app.model.Video.UserVideoReply, { as:"reply", foreignKey: 'user_id' })
      }
  
    return User;
  };