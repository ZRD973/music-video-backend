"use strict";

const Controller = require("../base");

class SysUserController extends Controller {
  // 登录
  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    const res = await ctx.service.sys.user.login(body);
    if(res.blackUser){
      ctx.body = {
        code: 200,
        message: "你被认定为违规用户，无权限登录平台",
        result: { success: false, message: "你被认定为违规用户，无权限登录平台" },
        success: false,
      };
      return;
    }
    if (res) {
      ctx.body = {
        code: 200,
        message: "登录成功",
        result: { token: res, success: true,message:"登录成功" },
        success: true,
      };
    } else {
      this.error({success: false, message: "登录失败，账号或密码错误" });
    }
  }
  // 注册
  async register() {
    const { ctx } = this;
    const body = ctx.request.body;
    const res = await ctx.service.sys.user.register(body);
    if (res.success) {
      this.success({ message: "注册成功", success: true });
    } else {
      this.error({ message: "注册失败," + res.message, success: false });
    }
  }
  // 修改密码
  async changePsw() {
    const { ctx } = this;
    const body = ctx.request.body;
    const res = await ctx.service.sys.user.changePsw(body);
    if (res.success) {
      this.success(res);
    } else {
      this.error(res);
    }
  }
  // 获取用户信息
  async getUserInfo() {
    const { ctx } = this;
    const res = await ctx.service.sys.user.getUserInfo();
    if (res) {
      this.success({ result:res });
    } else {
      this.error({ message: "查询失败！" });
    }
  }
  // 编辑用户信息
  async editUserInfo() {
    const { ctx } = this;
    const body = ctx.request.body;
    const res = await ctx.service.sys.user.editUserInfo(body);
    if (res) {
      this.success({result:res,success:true});
    } else {
      this.error({ message: "修改失败！",success:false });
    }
  }
  // 获取全部用户
  async getAllUser() {
    const { ctx } = this;
    const data = ctx.query
    const res = await ctx.service.sys.user.getAllUser(data);
    if (res) {
      this.success({result:res,success:true});
    } else {
      this.error(res);
    }
  }

}
module.exports = SysUserController;
