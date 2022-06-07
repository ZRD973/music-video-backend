"use strict";

const Service = require("egg").Service;
const path = require("path");
// const sd = require('silly-datetime');
const moment = require("moment");
const mkdirp = require("mkdirp");
const fs = require('fs');



class FileService extends Service {
  /**
   * 获取文件上传目录
   * @param {*} filename
   */

  // checkImgType(name) {
  //     return /\.(jpg|jpeg|png|gif)$/i.test(name);
  // }
  async getUploadFile(filename) {
    // 1.获取当前日期
    let day = moment(Date.now()).format("YYYYMMDD");
    // 2.创建图片保存的路径
    let dir;
    if (this.ctx.helper.checkImgType(filename)) {
      dir = path.join(this.config.uploadAvatarDir, day);
    }else{
      dir = path.join(this.config.uploadVideoDir, day);
    }
    await mkdirp(dir); // 不存在就创建目录
    let date = Date.now(); // 毫秒数
    // 返回图片保存的路径
    let uploadDir = path.join(dir, date + filename);
    // let uploadDir = path.join(dir, date + path.extname(filename));
    // app\public\avatar\upload\20200312\1536895331666.png
    return {
      uploadDir,
      saveDir: uploadDir.slice(3).replace(/\\/g, "/"),
    };
  }


  async putObsVideo(filename) {
    // 1.获取当前日期
    let day = moment(Date.now()).format("YYYYMMDD");
    // let date = Date.now(); // 毫秒数
    // 返回图片保存的路径
    let uploadDir = day + filename;
    return {
      uploadDir
    };
  }

  
}
module.exports = FileService;
