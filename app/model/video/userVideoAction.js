'use strict'

module.exports = app =>{
    const {INTEGER,STRING,DATE} = app.Sequelize;
    const UserVideoAction = app.model.define('user_video_action',{
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        video_id:INTEGER,
        user_id:INTEGER,
        favour:STRING,
        collect:INTEGER,
        created_at: DATE,
        updated_at: DATE,
    })

    UserVideoAction.associate = function() {
        UserVideoAction.belongsTo(app.model.Video.Video, { foreignKey: 'video_id', as:'action' })
        UserVideoAction.belongsTo(app.model.Sys.User, { foreignKey: 'user_id', as:"user" })
    }
    
    return UserVideoAction;
}