/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1645374427484_5382';
  config.uploadAvatarDir = 'app/public/avatar';
  config.uploadVideoDir = 'app/public/video';

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    username: 'root',
    password: '123456',
    port: 3306,
    database: 'music_video_platform',
    timezone: '+08:00',
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  };

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    password_salt: 'ntihcbRbx1mnFKKW38ZI7hoBMKbe35Me',
  };

  config.security = {
    csrf: {
        enable: false,
    },
  };
  config.jwt = {
    secret: '123edasfvbyj6SDG$t35W',
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };
  config.static  = {
    buffer: false
 };
  // config.multipart = {
  //   mode: 'stream',
  // };
  config.multipart = {
    // 表单 Field 文件名长度限制
    // fieldNameSize: 100,
    // 表单 Field 内容大小
    // fieldSize: '100kb',
    // 表单 Field 最大个数
    // fields: 10,
  
    // 单个文件大小
    fileSize: '500mb',
    // 允许上传的最大文件数
    // files: 10,
  };

  return {
    ...config,
    ...userConfig,
  };
};
