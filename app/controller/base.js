'use strict';

const { Controller } = require('egg');
class BaseController extends Controller {
  success(result) {
    this.ctx.body = {
      code: 200,
      success: true,
      result,
    };
  }

  error(result) {
    this.ctx.body = {
      code: 200,
      success: false,
      result,
    };
  }
}
module.exports = BaseController;
