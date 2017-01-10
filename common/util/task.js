"use strict";

const CronJob = require('cron').CronJob;
const Spider = require('./spider');
const DateCalc = require('./date');
const d = new DateCalc();
const logger = require('log4js').getLogger('access');
/*
Cron Ranges

 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 
 */

const Task = {
    fire: function() {
        this.hourly();
        this.daily();
        this.weekly();
    },
    // 07:00 - 22:00 每小時爬取一次最新熱門文章
    hourly: function() {
        new CronJob('00 00 7-22/1 * * *', function() {
            Spider.latest();
        }, function() {
            logger.info('hourly cron-job over @time:' + d.now())
        }, true, 'Asia/Taipei');
    },
    // 每天23:30 抓取當天所有文章
    daily: function() {
        new CronJob('00 30 23 * * *', function() {
            Spider.day();
        },function(){
            Spider.dayRefresh(d.today());
        }, function() {
            logger.info('daily cron-job over @date:' + d.today());
        }, true, 'Asia/Taipei');
    },
    // 每周三、日 00:30 更新七天前評論數
    // 從 Start 到 End 前一天
    weekly: function() {
        new CronJob('00 30 00 * * 0,3', function() {
            const start = d.before(),
                end = d.before(8);
            Spider.updateCmtCount(start, end);
            Spider.updateForumsInfo();
        }, function() {
            logger.info('weekly cron-job over ')
        }, true, 'Asia/Taipei');
    }
};

module.exports = Task;
