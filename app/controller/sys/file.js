"use strict";
const fs = require("fs");
const path = require("path");
const pump = require("pump");
const moment = require("moment");
const sendToWormhole = require("stream-wormhole");
const ObsClient = require("esdk-obs-nodejs");
const Controller = require("egg").Controller;
// 创建ObsClient实例
let obsClient = new ObsClient({
  access_key_id: "P4LGBQR9GQLOS70HDRYY",
  secret_access_key: "l5yzo5dBUZ3cZKhDxUH2WLOqHWZoZuncGABL3Ve6",
  server: "obs.cn-east-2.myhuaweicloud.com",
  //  popular-music-video
});
class FileController extends Controller {
  // 保存头像/封面/本地视频资源
  async saveLocalSource() {
    const { ctx } = this;
    const parts = ctx.multipart({ autoFields: true });
    let files = {};
    let stream;
    let url;
    while ((stream = await parts()) != null) {
      if (!stream.filename) {
        break;
      }
      const fieldname = stream.fieldname; // file表单的名字
      // 上传图片的目录
      const dir = await this.service.sys.file.getUploadFile(stream.filename);
      const target = dir.uploadDir;
      url = ctx.origin + dir.saveDir;
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);

      files = Object.assign(files, {
        [fieldname]: dir.saveDir,
        origin:this.ctx.origin
      });
    }
    // if (Object.keys(files).length > 0) {
    //     ctx.body = { "uploaded": 1, "fileName": "foo.jpg", "url": "/files/foo.jpg" }
    // } else {
    //     ctx.body = { "uploaded": 0, "fileName": "foo.jpg", "url": "/files/foo.jpg" }
    // }
    if (Object.keys(files).length > 0) {
      ctx.body = {
        code: 200,
        message: "上传成功",
        data: files,
        url:url
      };
    } else {
      ctx.body = {
        code: 500,
        message: "上传失败",
        data: {},
      };
    }
  }


  // 上传到obs存储
  async putObsVideo() {
    const { ctx } = this;
    const parts = ctx.multipart();
    let part;
    let uploadName;
    while ((part = await parts()) != null) {
      if (part.length) {
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        let day = moment(Date.now()).format("YYYYMMDD");
        let date = Date.now(); // 毫秒数
        // 返回图片保存的路径
        uploadName = day + date + part.filename;
        // 文件处理，上传到云存储等等
        try {
          obsClient.putObject(
            {
              Bucket: "popular-music-video",
              Key: uploadName,
              Body:part
            }, (err, result) => {
              if (err) {
                console.error("Error-->" + err);
              } else {
                console.log('RequestId-->' + result.InterfaceResult.RequestId);
              }
            }
          );
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
        ctx.body = {
          code: 200,
          message: "视频上传成功",
          url: "https://popular-music-video.obs.cn-east-2.myhuaweicloud.com/" + uploadName,
          success: true,
        };
      }
    }
    console.log("and we are done parsing the form!");

   
  }



  // 本地视频读取传给前端
    // async getLocalVideo() {
    //   const { ctx } = this;
    //   let res = ctx.res;
    //   let _path = path.join("app/public/video/20220324/1648055998522谁明浪子心.mp4");
    //   let stat = fs.statSync(_path);
    //   let fileSize = stat.size;
    //   let range = ctx.request.header.range;

    //   if (range) {
    //     let parts = range.replace(/bytes=/, "").split("-");
    //     let start = parseInt(parts[0], 10);
    //     let end = parts[1] ? parseInt(parts[1], 10) : start + 999999;

    //     // end 在最后取值为 fileSize - 1
    //     end = end > fileSize - 1 ? fileSize - 1 : end;

    //     let chunksize = end - start + 1;
    //     let file = fs.createReadStream(_path, { start, end });
    //     let head = {
    //       "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    //       "Accept-Ranges": "bytes",
    //       "Content-Length": chunksize,
    //       "Content-Type": "video/mp4",
    //       Vary: "Origin",
    //     };
    //     res.writeHead(206, head);
    //     ctx.body = file.pipe(res);
    //   } else {
    //     let head = {
    //       "Content-Length": fileSize,
    //       "Content-Type": "video/mp4",
    //     };
    //     res.writeHead(200, head);
    //     fs.createReadStream(_path).pipe(res);
    //   }
    // }
    
}

module.exports = FileController;
