"use strict";
const Service = require("egg").Service;
const { Op } = require("sequelize");
const { RecommendUserService,RecommendGoodsService } = require("../extend/filter");

class StatisticsService extends Service {
    
    // 音乐精选
    async getChoicenessList(param){
        const { ctx } = this;
        const limit = param.limit || 15;
        try {
            const allData = await ctx.model.Video.VideoAmount.findAll();
            const rankList = allData.map((item)=>{
                return {
                    id:item.video_id,
                    heat:item.favour_amount + (item.collect_amount * 3) + (item.comment_amount / 5),
                }
            });
            const video_id_list =  rankList.sort((a,b)=>{return b.heat-a.heat}).slice(0,limit).map(item=>{return item.id});
            const res = this.sortVideo(rankList, await ctx.model.Video.Video.findAll({ 
                where:{ id:video_id_list }, 
                include: {
                    model: ctx.model.Video.Singer,
                    as: "singer",
                }
            }));

            return res;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 排行榜
    async filterRankList(param){
        const { ctx } = this;
        const limit = param.limit || 15;
        const { style, area, type, recommend } = param;
        let where={};
        if(style){ where.style = style }
        if(area){ where.area = area }
        if(type){ where.type = type }
        try {
            if(style || area || type){
                return await ctx.model.transaction(async (f) => {
                    let video = await ctx.model.Video.Video.findAll({where, transaction: f});
                    if(recommend && video.length==1){
                        delete where.area;
                        video = await ctx.model.Video.Video.findAll({where, transaction: f});
                        if(recommend && video.length==1 || video.length==2){
                            delete where.style;
                            video = await ctx.model.Video.Video.findAll({where, transaction: f});
                        }
                    }
                    const video_list_id = await video.map(item => item.id)
                    const allData = await ctx.model.Video.VideoAmount.findAll({ where:{ video_id:video_list_id }}, { transaction: f});
                    const heatRank = allData.map((item)=>{
                        return {
                            id:item.video_id,
                            heat:item.favour_amount + (item.collect_amount * 3) + (item.comment_amount / 5),
                        }
                    });
                    const heat_rank_id =  heatRank.sort((a,b)=>{return b.heat-a.heat}).slice(0,limit).map(item=>{return item.id});
                    const heat =  this.sortVideo(heatRank, await ctx.model.Video.Video.findAll({ 
                        where:{id:heat_rank_id},
                        include: {
                            model: ctx.model.Video.Singer,
                            as: "singer",
                        },
                    },
                    { transaction: f}));
                    return heat;
                })
            }else{
                return await ctx.model.transaction(async (t) => {
                    const allData = await ctx.model.Video.VideoAmount.findAll({transaction: t});
                    const heatRank = allData.map((item)=>{
                        return {
                            id:item.video_id,
                            heat:item.favour_amount + (item.collect_amount * 3) + (item.comment_amount / 5),
                        }
                    });
                    const heat_rank_id =  heatRank.sort((a,b)=>{return b.heat-a.heat}).slice(0,limit).map(item=>{return item.id});
                    const heat = this.sortVideo(heatRank, await ctx.model.Video.Video.findAll({ where:{ id:heat_rank_id } }, { transaction: t }));
                    
                    const comment_rank_id = allData.sort((a,b)=> {return b.comment_amount-a.comment_amount }).slice(0,limit).map(item=>{return item.video_id});
                    const comment =  this.sortCount(allData, await ctx.model.Video.Video.findAll({ where:{ id:comment_rank_id } }, { transaction: t }),'comment_amount')

                    const favour_rank_id = allData.sort((a,b)=> {return b.favour_amount-a.favour_amount }).slice(0,limit).map(item=>{return item.video_id});
                    const favour = this.sortCount(allData, await ctx.model.Video.Video.findAll({ where:{ id:favour_rank_id } }, { transaction: t }),'favour_amount')

                    const collect_rank_id = allData.sort((a,b)=> {return b.collect_amount-a.collect_amount }).slice(0,limit).map(item=>{return item.video_id});
                    const collect = this.sortCount(allData, await ctx.model.Video.Video.findAll({ where:{ id:collect_rank_id } }, { transaction: t }),'collect_amount')
                    
                    let rankInk = {
                        heat,
                        comment,
                        favour,
                        collect
                    }
                    
                    return rankInk;
                })
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    sortVideo(rank,data,count) {
        let arr= [];
        for (let i = 0; i < rank.length; i++) {
           for (let j = 0; j < data.length; j++) {
            // rank[i].heat || rank[i].heat == 0 && 
            if(rank[i].id==data[j].id){
                data[j].dataValues.heat = rank[i].heat;
                arr.push(data[j]);
            }
           }
        }
        return arr;
    }
    sortCount(rank,data,count){
        let arr= [];
        for (let i = 0; i < rank.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if(rank[i].video_id==data[j].id){
                    data[j].dataValues.heat = rank[i][count];
                    arr.push(data[j]);
                }
            }
         }
         return arr;

    }

    // 推荐
    async recommend(param){
        const { ctx } = this;
        const limit = param.limit || 15;
        const { userid } = ctx.state.user;
        try {
            return await ctx.model.transaction(async (t) => {
                
                const allVideo = await ctx.model.Video.UserVideoAction.findAll({
                    where:{ user_id:userid }
                },{transaction:t})
                let videoByUserId = allVideo.filter(item=> item.favour || item.collect ).map(value=>value.video_id)
                
                const Type = await ctx.model.Video.Type.findAll({transaction:t});
                let typeModel = Type.map(item=>{
                    if(item.type=="style"){
                        let arr = item.content.split(";");
                        arr.shift();
                        let model = arr.map(value=>{ return { style:value, count:0, } })
                        return model;
                    } 
                })
                
                const videoByUser = await ctx.model.Video.Video.findAll({
                    where:{ id:videoByUserId}
                },{transaction:t})
                // videoByUser.forEach(item=>{
                //     typeModel[2].forEach(subItem=>{
                //         if(item.style == subItem.style){
                //             subItem.count++;
                //         }
                //     })
                // })
                for (let i = 0; i < videoByUser.length; i++) {
                    for (let j = 0; j < typeModel[2].length; j++) {
                        if(videoByUser[i].style ==  typeModel[2][j].style){
                            typeModel[2][j].count++;
                            break;
                        }
                    }
                }
                
                typeModel[2].sort((a,b)=>{ return b.count-a.count })
                let model = typeModel[2].map(item=>{return item.style})
                model = ("'" + model.join("','")+ "'").replace(/^\"|\"$/g,'');
                console.log(1111,model);
                const [results, metadata] = await this.app.model.query(`
                    SELECT * FROM music_video as v 
                    JOIN video_singer as vs on v.id = vs.video_id
                    JOIN music_singer as s on s.id = vs.singer_id 
                    ORDER BY FIELD(style,${model + ",'其他'"} )`,
                {transaction:t});

                return results;
            })
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 协同过滤推荐
    async collaborativeFilter(param){
        const { ctx } = this;
        // flag 1：基于物品    0：基于用户
        // videoSame  1：查找视频相似读
        const { flag, videoSame, video_id } = param;
        const { userid } = ctx.state.user;
        try {
            return ctx.model.transaction(async(t)=>{
                const Model = await ctx.model.Video.UserVideoAction.findAll({
                    where:{ [Op.or]: [{ favour: 1 }, { collect: 1 }], },
                    attributes: ["video_id", "user_id"],
                },{transaction:t});
                let model = Model.map(item=>{ return { userId:item.user_id, goodsId:item.video_id, } })
                console.log("数据模型：",model);
                let video_id_list=[];
                let goodsGrade_id_list=[];
                let video_id_list_str="";
                console.log("当前用户id：",userid);
                if(flag==1){
                    const recommendGoodsService = new RecommendGoodsService(model,userid);
                    if(videoSame){
                        let result = recommendGoodsService.getGoodsGrade(userid, video_id);
                        goodsGrade_id_list = result.map(item=>{
                            return item.goodsId
                        })
                        console.log("音乐相似度id：",goodsGrade_id_list);
                        video_id_list_str = ("'" + goodsGrade_id_list.join("','")+ "'").replace(/^\"|\"$/g,'');
                    }else{
                        video_id_list = recommendGoodsService.start();
                        console.log("推荐视频id:",video_id_list);
                        video_id_list_str = ("'" + video_id_list.join("','")+ "'").replace(/^\"|\"$/g,'');
                    }
                }else{
                    const recommendUserService = new RecommendUserService(model,userid,5);
                    video_id_list = recommendUserService.start();
                    console.log("推荐视频id:",video_id_list);
                    video_id_list_str = ("'" + video_id_list.join("','")+ "'").replace(/^\"|\"$/g,'');
                }

                const [results, metadata] = await this.app.model.query(`
                    SELECT v.id,v.video_url,v.cover_url,v.title,v.intro,v.style,v.area,v.type,s.name FROM music_video as v
                    JOIN video_singer as vs on v.id = vs.video_id
                    JOIN music_singer as s on s.id = vs.singer_id
                    where v.id in (${video_id_list_str})
                    ORDER BY FIELD(v.id,${video_id_list_str}) ASC`,
                {transaction:t});
                return results
            })

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 获取视频风格数量
    async getStyleCount(param){
        const { ctx } = this;
        try {
            return ctx.model.transaction(async (t)=>{
                const Type = await ctx.model.Video.Type.findAll({transaction:t});
                let typeModel = Type.map(item=>{
                    if(item.type=="style"){
                        let arr = item.content.split(";");
                        arr.shift();
                        let model = arr.map(value=>{ return { name:value, value:0, } })
                        return model;
                    } 
                })
                const video = await ctx.model.Video.Video.findAll({transaction:t});
                for (let i = 0; i < video.length; i++) {
                    for (let j = 0; j < typeModel[2].length; j++) {
                        if(video[i].style ==  typeModel[2][j].name){
                            typeModel[2][j].value++;
                            break;
                        }
                    }
                }
                return typeModel[2];
            })
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
    // 获取点赞收藏评论数量
    async getActionCount(param){
        const { ctx } = this;
        try {
            return ctx.model.transaction(async(t)=>{
                const favour = await ctx.model.Video.VideoAmount.sum('favour_amount',{transaction:t});
                const collect = await ctx.model.Video.VideoAmount.sum('collect_amount',{transaction:t});
                const comment = await ctx.model.Video.VideoAmount.sum('comment_amount',{transaction:t});
                return { favour, collect, comment };
            })
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 获取视频、播放、用户、评论数
    async getTotalCount(param){
        const { ctx } = this;
        const date = [1,7,30,365]
        let day = param.day ? param.day: date[2];
        try {
            return ctx.model.transaction(async(t)=>{

                const videoLimit =  await ctx.model.Video.Video.count({
                    where:{
                        created_at:{
                            [Op.between]:[new Date(new Date() - day * 24 * 60 * 60 * 1000),new Date()],
                            // [Op.lt]: new Date(), [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                },{transaction:t})
                const videoTotal = await ctx.model.Video.Video.count({transaction:t});

                const userLimit =  await ctx.model.Sys.User.count({
                    where:{
                        created_at:{
                            [Op.between]:[new Date(new Date() - day * 24 * 60 * 60 * 1000),new Date()],
                        }
                    }
                },{transaction:t})
                const userTotal = await ctx.model.Sys.User.count({transaction:t});
                
                const commentLimit =  await ctx.model.Video.UserVideoReply.count({
                    where:{
                        created_at:{
                            [Op.between]:[new Date(new Date() - day * 24 * 60 * 60 * 1000),new Date()],
                        }
                    }
                },{transaction:t})
                const commentTotal = await ctx.model.Video.UserVideoReply.count({transaction:t});

                
                const viewsLimit =  await ctx.model.Video.Video.sum("views",{
                    where:{
                        updated_at:{
                            [Op.between]:[new Date(new Date() - day * 24 * 60 * 60 * 1000),new Date()],
                        }
                    }
                },{transaction:t});
                const viewsTotal = await ctx.model.Video.Video.sum("views",{transaction:t});
            
                return { 
                    videoLimit,videoTotal,
                    userLimit,userTotal,
                    commentLimit,commentTotal,
                    viewsLimit,viewsTotal
                };
            })

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // 获取播放量
    async getPlayCount() {
        const { ctx } = this;
        try {
            let data= []
            return ctx.model.transaction(async(t)=>{
                console.time();
                for (let i = 7; i > 0; i--) {
                    let a = await ctx.model.Video.Video.sum("views",{
                        where:{
                            updated_at:{
                                [Op.between]:[new Date(new Date() - i * 24 * 60 * 60 * 1000),new Date(new Date() - (i-1) * 24 * 60 * 60 * 1000)],
                            }
                        }
                    },{transaction:t});
                    if(!a) a=0;
                    data.push(a);
                }
                console.timeEnd();
                let total = await ctx.model.Video.Video.sum("views");


                return {
                    data,
                    total
                }
            })
        } catch (error) {
            console.log(error);
            return null;
        }
    }


    

    
}


module.exports = StatisticsService;