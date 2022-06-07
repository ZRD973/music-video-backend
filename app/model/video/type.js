'use strict'

module.exports = app =>{
    const {INTEGER,STRING} = app.Sequelize;
    const Type = app.model.define('music_type',{
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        label: STRING(10),
        type:STRING(10),
        content:STRING(255),
    })
    
    return Type;
}