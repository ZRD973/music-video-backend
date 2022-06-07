'use strict'

module.exports = app =>{
    const {INTEGER} = app.Sequelize;
    const VideoAmount = app.model.define('video_amount',{
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        video_id: INTEGER,
        comment_amount: INTEGER,
        favour_amount: INTEGER,
        collect_amount: INTEGER,
    })
    VideoAmount.associate = function () {
      VideoAmount.belongsTo(app.model.Video.Video, { foreignKey: 'video_id',as:"amount" })
  }
    return VideoAmount;
}