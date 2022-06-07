'use strict'

module.exports = app =>{
    const {INTEGER,STRING,DATE} = app.Sequelize;
    const UserVideoReply = app.model.define('user_video_reply',{
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        video_id:INTEGER,
        user_id:INTEGER,
        content:STRING,
        upt_act:INTEGER,
        created_at: DATE,
    })

    UserVideoReply.associate = function() {
        UserVideoReply.belongsTo(app.model.Video.Video, { foreignKey: 'video_id' })
        UserVideoReply.belongsTo(app.model.Sys.User, { foreignKey: 'user_id', as:"user" })
    }
    
    return UserVideoReply;
}