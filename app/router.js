'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = app => {
  const { router, controller, jwt } = app;
  router.get('/', controller.home.index);
  // 上传接口
  // router.get('/public/videos', controller.sys.file.getLocalVideo); //本地视频读取传给前端
  router.post('/file/upload', controller.sys.file.saveLocalSource);
  router.post('/video/upload', controller.sys.file.putObsVideo);
  // 用户接口
  router.post('/user/register', controller.sys.user.register);
  router.post('/user/login', controller.sys.user.login);
  router.post('/change/psw', controller.sys.user.changePsw);
  router.get('/user/info', jwt, controller.sys.user.getUserInfo);
  router.post('/user/editinfo', jwt, controller.sys.user.editUserInfo);
  router.get('/user/all', jwt, controller.sys.user.getAllUser);
  // 视频接口
  router.get('/video', jwt, controller.video.getVideoList);
  router.post('/video', jwt, controller.video.addVideo);
  router.put('/video', jwt, controller.video.updateVideo);
  router.delete('/video', jwt, controller.video.deleteVideo);
  router.get('/video/detail', jwt, controller.video.getOneVideo);
  router.get('/user/collect', jwt, controller.video.getUserCollect);
  router.put('/update/action', jwt, controller.video.updateFavourOrCollect);
  router.get('/classify', jwt, controller.video.getTypeSort);
  router.put('/classify', jwt, controller.video.updateTypeSort);
  router.get('/singer', jwt, controller.video.getSingerInfo);
  router.post('/singer', jwt, controller.video.addSinger);
  router.put('/singer', jwt, controller.video.updateSinger);
  // 评论接口
  router.post('/reply', jwt, controller.video.addVideoReply);
  router.get('/reply', jwt, controller.video.getVideoReply);
  router.delete('/reply', jwt, controller.video.deleteVideoReply);
  // 统计接口
  router.get('/choiceness', jwt, controller.statistics.getChoicenessList);
  router.get('/rank', jwt, controller.statistics.filterRankList);
  router.get('/recommend', jwt, controller.statistics.recommend);
  router.get('/occf', jwt, controller.statistics.collaborativeFilter);
  router.get('/count/style', jwt, controller.statistics.getStyleCount);
  router.get('/count/action', jwt, controller.statistics.getActionCount);
  router.get('/count/total', jwt, controller.statistics.getTotalCount);
  router.get('/count/play', jwt, controller.statistics.getPlayCount);
};
