'use strict';
const Controller = require("./base");

class StatisticsController extends Controller {
    // 音乐精选
    async getChoicenessList() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.getChoicenessList(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 排行榜
    async filterRankList() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.filterRankList(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 推荐
    async recommend() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.recommend(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 协同过滤推荐
    async collaborativeFilter() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.collaborativeFilter(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 获取视频风格数量
    async getStyleCount() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.getStyleCount(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 获取点赞收藏评论数量
    async getActionCount() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.getActionCount(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 获取视频、播放、用户、播放数
    async getTotalCount() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.getTotalCount(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    // 获取播放量
    async getPlayCount() {
        const { ctx } = this;
        const param = ctx.query;
        const res = await ctx.service.statistics.getPlayCount(param);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }
}

module.exports = StatisticsController;