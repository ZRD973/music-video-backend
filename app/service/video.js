"use strict";
const Service = require("egg").Service;
const moment = require("moment");
moment.locale("zh-cn");
const { Op } = require("sequelize");
class VideoService extends Service {
  async addVideo(body) {
    const { ctx } = this;
    const { singer } = body;
    body.views = 0;
    try {
      return ctx.model.transaction(async(t)=>{
        const res = await ctx.model.Video.Video.create(body,{transaction:t});
        if (res) {
          await ctx.model.Video.VideoAmount.create({
            video_id: res.dataValues.id,
            comment_amount: 0,
            favour_amount: 0,
            collect_amount: 0,
          },{transaction:t});
          await ctx.model.Video.VideoSinger.create({
            video_id: res.dataValues.id,
            singer_id: singer,
          },{transaction:t});
          return res;
        }
      })
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getVideoList(data) {
    const { ctx } = this;
    const { limit, page, type, area, style, search, singer } = data;
    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { intro: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (type) {
      where.type = type;
    }
    if (area) {
      where.area = area;
    }
    if (style) {
      where.style = style;
    }
    try {
      const offset = (page - 1) * limit;
      const list = await ctx.model.Video.Video.findAndCountAll({
        distinct: true,
        include: {
          model: ctx.model.Video.Singer,
          as: "singer",
        },
        limit: parseInt(limit),
        offset,
        where,
        order: [["created_at", "desc"]],
      });
      if (singer) {
        let count = 0;
        return {
          rows: list.rows.filter((item) => {
            let arr = item.dataValues.singer;
            if (arr.length > 0) {
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].dataValues.id == singer) {
                  count++;
                  return arr[i].dataValues;
                }
              }
            }
          }),
          count: count,
        };
      }
      return list;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateVideo(body) {
    const { ctx } = this;
    const { id, singer } = body;
    try {
      const data = await ctx.model.Video.Video.findByPk(id);
      const res = await data.update(body);
      let singer_id = Number(singer[0].name);
      if (singer_id) {
        await ctx.model.Video.VideoSinger.update(
          { singer_id },
          {
            where: { video_id: id },
          }
        );
      }
      if (res) {
        return res;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteVideo(body) {
    const { ctx } = this;
    try {
      await ctx.model.Video.Video.destroy({
        where: { id: body.id },
      });
      await ctx.model.Video.VideoSinger.destroy({
        where: { video_id: body.id },
      });
      await ctx.model.Video.VideoAmount.destroy({
        where: { video_id: body.id },
      });
      return true;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getOneVideo(id) {
    const { ctx } = this;
    const { userid } = ctx.state.user;
    try {
        const isExist = await ctx.model.Video.UserVideoAction.findOrCreate({
          where: {
            video_id: id,
            user_id: userid,
          },
          defaults: {
            favour: 0,
            collect: 0,
            created_at: new Date(),
          },
        });
        if(isExist){
          const data = await ctx.model.Video.Video.findOne({
            where: {
              id,
            },
            include: [
              { model: ctx.model.Video.Singer, as: "singer" },
              {
                model: ctx.model.Video.UserVideoAction,
                as: "action",
                where: { user_id: userid },
              },
              {
                model: ctx.model.Video.VideoAmount,
                as: "amount",
                where:{ video_id: id }
              },
            ],
          });
          if(data){
            const res = await data.update({ views:data.dataValues.views+1, updated_at:new Date() })
            return res;
          }
        }


    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserCollect() {
    const { ctx } = this;
    const { userid } = ctx.state.user;
    try {
      const data = await ctx.model.Video.UserVideoAction.findAll({
        where: {
          user_id:userid,
          collect:1
        }
      });
      const video_id_list = data.map((item)=>{
        return item.video_id
      })
      const res = await ctx.model.Video.Video.findAll({
        where:{
          id:video_id_list
        },
        include: {
          model: ctx.model.Video.Singer,
          as: "singer",
        },

      })
      return res;
    } catch (error) {
      
    }
  }

  async updateFavourOrCollect({ video_id, favour, collect, favour_nums, collect_nums, comment_nums }) {
    const { ctx } = this;
    const { userid } = ctx.state.user;
    try {
        await ctx.model.Video.VideoAmount.update({
            favour_amount: favour_nums ,
            collect_amount: collect_nums,
            comment_amount:comment_nums,
          },{
            where:{ video_id, }
        });
      const data = await ctx.model.Video.UserVideoAction.update({
          favour: favour ? 1 : 0,
          collect: collect ? 1 : 0,
          updated_at: new Date(),
        },{
          where: { video_id, user_id: userid, },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTypeSort(sort) {
    const { ctx } = this;
    try {
      const data = await ctx.model.Video.Type.findAll();
      const classify = data.map((item) => {
        let Temp = item.dataValues.content.split(";");
        if (!sort) {
          Temp.push(Temp.shift());
        }
        return {
          label: item.dataValues.label,
          type: item.dataValues.type,
          options: Temp.map((elem) => {
            return { label: elem ? elem : sort ? "全部" : "其他", value: elem };
          }),
        };
      });
      return {
        classify,
        data,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateTypeSort(body) {
    const { ctx } = this;
    try {
      body.forEach(async (item) => {
        await ctx.model.Video.Type.update(
          { content: item.content },
          {
            where: { id: item.id },
          }
        );
      });
      return true;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSingerInfo(data) {
    const { ctx } = this;
    let { name, page, limit } = data;
    if (!page || !limit) {
      page = 1;
      limit = 10;
    }
    let where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    const offset = (page - 1) * limit;
    try {
      const res = await ctx.model.Video.Singer.findAndCountAll({
        offset,
        limit: parseInt(limit),
        distinct: true,
        where,
        include: {
          model: ctx.model.Video.Video,
          as: "rows",
        },
      });
      res.rows.forEach((item) => {
          if(item.img_path){
              item.img_path = ctx.origin + '/' + item.img_path;
          }
      })
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addSinger(body) {
    const { ctx } = this;
    try {
      const data = await ctx.model.Video.Singer.create(body);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateSinger(body) {
    const { ctx } = this;
    const { name, intro } = body;
    try {
      const data = await ctx.model.Video.Singer.update(
        { name, intro },
        {
          where: { id: body.id },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addVideoReply(body) {
    const { ctx } = this;
    try {
      body.created_at = new Date();
      body.upt_act = 1;
      const res = await ctx.model.Video.UserVideoReply.create(body);
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getVideoReply(data) {
    const { ctx } = this;
    const { id } = data;
    try {
      const res = await ctx.model.Video.UserVideoReply.findAndCountAll({
        include: {
          model: ctx.model.Sys.User,
          as: "user",
          attributes: ["avatar", "name"],
        },
        where: { video_id: id },
        order: [["created_at", "desc"]],
      });
      let time;
      let now = new Date();
      res.rows.forEach((item) => {
        if(item.dataValues.user.dataValues.avatar){
            item.dataValues.user.dataValues.avatar = ctx.origin + item.dataValues.user.dataValues.avatar;
        }
        time = new Date(item.dataValues.created_at);
        if ((now - time) / (1000 * 60 * 60 * 24) >= 3) {
          item.dataValues.created_at = moment(
            item.dataValues.created_at
          ).format("YYYY-MM-DD");
        } else {
          item.dataValues.created_at = moment(
            item.dataValues.created_at
          ).fromNow();
        }
      });
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteVideoReply(body) {
    const { ctx } = this;
    try {
      const { id, del } = body;
      if (del) {
        const res = await ctx.model.Video.UserVideoReply.update(
          { upt_act: 0 },
          {
            where: { id },
          }
        );
        return res;
      } else {
        const res = await ctx.model.Video.UserVideoReply.destroy({
          where: { id },
        });
        return res;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
module.exports = VideoService;
