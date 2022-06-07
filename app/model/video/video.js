'use strict';
const base = require('../base');

module.exports = app => {
    const { STRING, INTEGER } = app.Sequelize;
  
    const Video = app.model.define('music_video',
      Object.assign(base(app), {
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        title: STRING(255),
        type: STRING(10),
        area: STRING(10),
        style: STRING(10),
        video_url: STRING(255),
        cover_url: STRING(255),
        intro: STRING(255),
        views: INTEGER
      }));

      Video.associate = () =>{
        Video.belongsToMany(app.model.Video.Singer,{
          as:'singer',
          through:app.model.Video.VideoSinger,
          foreignKey: 'video_id',
          otherKey: 'singer_id',
        });
        Video.hasMany(app.model.Video.UserVideoReply,{foreignKey: 'video_id'});
        Video.hasOne(app.model.Video.UserVideoAction,{foreignKey: 'video_id', as:"action"});
        Video.hasOne(app.model.Video.VideoAmount,{foreignKey: 'video_id', as:"amount"});
      }

    return Video;
  };