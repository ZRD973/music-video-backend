'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize;

    const VideoSinger = app.model.define('video_singer', {
        video_id: INTEGER,
        singer_id: INTEGER,
    });

    return VideoSinger;
};