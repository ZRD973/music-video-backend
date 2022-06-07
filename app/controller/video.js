'use strict';
const Controller = require("./base");

class VideoController extends Controller {

    async addVideo() {
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.addVideo(body);
        if(res){
            this.success({message:true,code:200});
        }else{
            this.error({message:false,code:200});
        }
    }

    async getVideoList() {
        const { ctx } = this;
        const data = ctx.query;
        const res = await ctx.service.video.getVideoList(data);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async updateVideo() {
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.updateVideo(body);
        if(res){
            this.success({data:res,success:true});
        }else{
            this.error({data:res,success:false});
        }
    }

    async deleteVideo() {
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.deleteVideo(body);
        if(res){
            this.success({ success: true, msg: '删除成功' });
        }else{
            this.error({ success: true, msg: '删除失败' });
        }
    }

    async getOneVideo() {
        const { ctx } = this;
        const { id } = ctx.query;
        const res = await ctx.service.video.getOneVideo(id);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async getUserCollect() {
        const { ctx } = this;
        const res = await ctx.service.video.getUserCollect();
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async updateFavourOrCollect(){
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.updateFavourOrCollect(body);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async getTypeSort() {
        const { ctx } = this;
        const { sort="" } = ctx.query;
        const res = await ctx.service.video.getTypeSort(sort);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async updateTypeSort() {
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.updateTypeSort(body);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async getSingerInfo() {
        const { ctx } = this;
        const data = ctx.query;
        const res = await ctx.service.video.getSingerInfo(data);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async addSinger() {
        const { ctx } = this;
        const data = ctx.request.body;
        const res = await ctx.service.video.addSinger(data);
        if(res){
            this.success({success:true,message:"添加成功!"});
        }else{
            this.error({success:false,message:"添加失败!"});
        }
    }

    async updateSinger() {
        const { ctx } = this;
        const data = ctx.request.body;
        const res = await ctx.service.video.updateSinger(data);
        if(res){
            this.success({success:true,message:"修改成功!"});
        }else{
            this.error({success:false,message:"修改失败!"});
        }
    }

    async addVideoReply(){
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.addVideoReply(body);
        if(res){
            this.success({success:true,message:"感谢您的发言!"});
        }else{
            this.error({success:false,message:"发布失败!"});
        }
    }

    async getVideoReply() {
        const { ctx } = this;
        const data = ctx.query;
        const res = await ctx.service.video.getVideoReply(data);
        if(res){
            this.success(res);
        }else{
            this.error(res);
        }
    }

    async deleteVideoReply(){
        const { ctx } = this;
        const body = ctx.request.body;
        const res = await ctx.service.video.deleteVideoReply(body);
        if(res){
            this.success({success:true,message:"删除成功!"});
        }else{
            this.error({success:false,message:"删除失败!"});
        }
    }

}

module.exports = VideoController;
