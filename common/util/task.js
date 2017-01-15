"use strict";

const CronJob = require('cron').CronJob;
const Spider = require('./spider');
const DateCalc = require('./date');
const date = new DateCalc();
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
        this.endDaily();
    },
    // 07:00 - 22:00 每小時爬取一次最新熱門文章
    hourly: function() {
        new CronJob('00 00 7-22 * * *', function() {
            Promise.resolve(Spider.latest())
                .then(function() {
                    logger.info('hourly cron-job over @time: ' + date.now());
                })
                .catch(function(err) {
                    logger.error('hourly cron-job err : ' + err);
                })
        }, true, 'Asia/Taipei');
    },
    // 每天23:30 抓取當天所有文章
    daily: function() {
        new CronJob('00 30 23 * * *', function() {
                Promise.resolve(Spider.day())
                    .then(function() {
                        logger.info('daily cron-job over @date: ' + date.today());
                    })
                    .catch(function(err) {
                        logger.error('daily cron-job err : ' + err);
                    })
            },
            true, 'Asia/Taipei');
    },
    // 每天00:30 處理錯誤資料
    endDaily: function() {
        new CronJob('00 30 00 * * *', function() {
                Promise.resolve(Spider.dayRefresh())
                    .then(function() {
                        logger.info('endDaily cron-job over @date: ' + date.today());
                    })
                    .catch(function(err) {
                        logger.error('endDaily cron-job err : ' + err);
                    })
            },
            true, 'Asia/Taipei');
    },
    // 每周三、日 00:50 更新七天前評論數
    // 從 Start 到 End 前一天
    weekly: function() {
        new CronJob('00 50 00 * * 0,3', function() {
            const start = date.before(),
                end = date.before(8);
            Promise.resolve(Spider.updateCmtCount(start, end))
                .then(function() {
                    Spider.updateForumsInfo();
                })
                .then(function() {
                    logger.info('weekly cron-job over ');
                })
                .catch(function(err) {
                    logger.error('weekly cron-job err : ' + err);
                })
        }, true, 'Asia/Taipei');
    }
};

module.exports = Task;
