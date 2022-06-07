"use strict";
const md5 = require("md5");
const Service = require("egg").Service;
const { Op } = require("sequelize");
const moment = require('moment');
moment.locale('zh-cn');
class SysUserService extends Service {

  async login({ account, password }) {
    const { app, ctx } = this;
    password = md5(md5(password) + app.config.password_salt);
    const user = await ctx.model.Sys.User.findOne({
      where: { account },
    });
    if(user.dataValues.delete_flag == 1){
      return {blackUser:true} //黑名单用户
    }
    if (!user) {
      return false;
    }

    if (user.password === password) {
      const token = app.jwt.sign(
        {
          userid: user.id,
          account: user.account,
          name: user.name,
        },
        app.config.jwt.secret,
        { expiresIn: 60 * 60 * 24 * 7 }
      );
      return token;
    }
    return false;
  }

  async register(body) {
    const { app, ctx } = this;
    let psw = body.password;
    body.password = md5(md5(psw) + app.config.password_salt);
    try {
      const exit = await ctx.model.Sys.User.findOne({
        where: { account: body.account },
      });
      if (exit) {
        return { success: false, message: "账号已经存在！" };
      }
      body.delete_flag = 0;
      body.role = 2;
      const user = await ctx.model.Sys.User.create(body);
      if (user) {
        return { success: true };
      }
    } catch {
      console.log(error);
      return { success: false };
    }
  }

  async changePsw(body) {
    const { app, ctx } = this;
    const { account, passwordOld, passwordNew } = body;
    console.log(body);
    try {
      const user = await ctx.model.Sys.User.findOne({
        where: {
          account,
        },
      });
      if (!user) {
        return { success: false, message: "账号不存在，请输入正确账号！" };
      }
      let oldPassword = md5(md5(passwordOld) + app.config.password_salt);
      if (user.password !== oldPassword) {
        return { success: false, message: "当前密码输入错误，请输入正确密码！" };
      }
      await user.update({
        password: md5(md5(passwordNew) + app.config.password_salt),
        updated_at: ctx.helper.formatTime(new Date()),
      });
      return { success: true, message: "密码修改成功！！" };
    } catch (error) {
      console.log(error);
      return { success: false, message: "密码修改失败！！" };
    }
    
  }

  async getUserInfo() {
    const { ctx } = this;
    const { userid } = ctx.state.user;
    try {
      const user = await ctx.model.Sys.User.findOne({
        where: {
          id: userid,
        },
      });
      if(user.avatar){
        user.avatar = ctx.origin + user.avatar;
      }
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  async editUserInfo(body) {
    const { ctx } = this;
    const { userid } = ctx.state.user;
    body.updated_at = new Date();
    try {
      const user = await ctx.model.Sys.User.update(body,{
        where: {
          id : body.id ? body.id : userid
        }
      });
      if(user){
        const res = await ctx.model.Sys.User.findOne({
          where: { id: userid },
        });
        return res;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllUser(data) {
    const { ctx } = this;
    const { limit, page, search, role, del } = data;
    try {
      const offset = (page - 1) * limit
      const user = await ctx.model.Sys.User.findAndCountAll({
        limit:parseInt(limit),
        offset,
        distinct: true,
        include:{
          model:ctx.model.Video.UserVideoReply,
          as:"reply",
      },
        where: {
          [Op.or]: [
            { account: { [Op.like]: `%${search}%` } },
            { name: { [Op.like]: `%${search}%` } } 
          ],
          role:{  [Op.ne]: role == 1 ? 2 : role == 2 ? 1 : "" },
          delete_flag:{ [Op.in] : del == "" ? [0,2] : [del]}
         },
      });
      user.rows.forEach(item=>{
        let temp = item.dataValues.reply.filter((elem)=>{
          elem.dataValues.created_at = moment(elem.dataValues.created_at).format("YYYY-MM-DD hh:mm:ss");
          return elem.dataValues.upt_act == 0;
        })
        item.dataValues.reply = temp;
      })
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
}
module.exports = SysUserService;
