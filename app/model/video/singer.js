'use strict'

module.exports = app =>{
    const {INTEGER,STRING} = app.Sequelize;
    const Singer = app.model.define('music_singer',{
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        name: STRING(20),
        intro:STRING(255),
        img_path:STRING(100)
    })
    Singer.associate = () =>{
        Singer.belongsToMany(app.model.Video.Video,{
          as:'rows',
          through:app.model.Video.VideoSinger,
          foreignKey: 'singer_id',
          otherKey: 'video_id',
        });
      }
    return Singer;
}