"use strict";
const CronJob = require('cron').CronJob;
const Promise = require('es6-promise').Promise;

const CONFIG = require('../../config/config');

const ArticleDAO = require('../db/models/article');
const ArticleListDAO = require('../db/models/articlelist');
const CmtCountDAO = require('../db/models/cmtCount');
const CommentsDAO = require('../db/models/comments');
const LatestDAO = require('../db/models/latest');
const ForumsDAO = require('../db/models/forums');
const TmpDAO = require('../db/models/tmp');

const DcardAPI = require('../api/api');

const DateCalc = require('./date');

const articleListDAO = new ArticleListDAO();
const articleDAO = new ArticleDAO();
const cmtCountDAO = new CmtCountDAO();
const commentsDAO = new CommentsDAO();
const latestDAO = new LatestDAO();
const forumsDAO = new ForumsDAO();
const tmpDAO = new TmpDAO();

const logger = require('log4js').getLogger('access');

const Spider = {
    fire: function(start, end) {
        // Spider.day(start);
        historyDAO.count({ dtime: start }).then(function(d) {
            if (d > 0) {
                return;
            }
            start = new DateCalc(start).after();
            end = new DateCalc(end).after();

            var interval = '*/' + CONFIG.spider.interval + ' * * * * *';
            var spiderJob = new CronJob(interval, function() {
                if (d == 0) {
                    Spider.day(end);
                    var dateCalc = new DateCalc(end);
                    end = dateCalc.after();
                    if (start == end) {
                        setTimeout(function() {
                            Spider.day(end);
                        }, CONFIG.spider.interval * 1000)
                        spiderJob.stop()
                    }
                } else {
                    spiderJob.stop()
                }
            }, null, true, 'Asia/Taipei');
        });
    },
    // 熱門文章的清單
    day: function(articleId) {
        return DcardAPI.getAllArticle(articleId)
            .then(function(articleList) {
                const d = articleList,
                    laid = d[d.length - 1].id,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    // 日期重新格式化
                    // createdAt: 2016-11-20T10:56:36.075Z
                    console.log("title = " + d[i].title);
                    console.log("id = " + d[i].id);
                    console.log("=======================");
                    const date = d[i].createdAt.substr(0, 10).split("-").join('');
                    const data = {
                        id: d[i].id,
                        title: d[i].title,
                        time: date,
                        month: date.substr(0, 6),
                        year: date.substr(0, 4)
                    };
                    //Spider.dataOne(data);
                }

                return Promise.resolve({ laid: laid, length: length });

            })
            .then(function(d) {
                console.log("data - laid = " + d.laid);
                console.log("length " + d.length);

                if (d.length == 30) {
                    Spider.day(d.laid);
                } else {
                    logger.info('article save complete !');
                }

            });
    },
    dayRefresh: function(time) {
        const query = { time: time };
        return tmpDAO.count({ time: time })
            .then(function(d) {
                if (d == 0) {
                    return Promise.reject('over');
                } else {
                    return articleListDAO.delete(query)
                }
            })
            .then(function() {
                return articleDAO.delete(query);
            })
            .then(function() {
                return commentsDAO.delete(query);
            })
            .then(function() {
                return cmtCountDAO.delete(query);
            })
            .then(function() {
                Spider.day(new DateCalc(time).after())
                    .then(function() {
                        return tmpDAO.delete(query);
                    })
            })
            .catch(function(err) {
                tmpDAO.save({ aid: '', time: time });
                return Promise.reject(err);
            })
    },
    dataOne: function(data) {
        return Spider.articleList(data)
            .then(function(d) {
                return Spider.article(d.aid, d.time);
            })
            .then(function(d) {
                return Spider.cmtHot(d.aid, d.time);
            })
            .then(function(d) {
                return Spider.cmtNew(d.aid, d.time);
            })
            .then(function(d) {
                return Spider.cmtCount(d.aid, d.time);
            })
            .catch(function(err) {
                tmpDAO.save({ aid: '', time: data.time });
                logger.error('get dataOne error: ' + err);
            });
    },
    // 文章清單
    articleList: function(data) {
        return articleListDAO.save(data)
            .then(function() {
                return Promise.resolve({ aid: data.id, time: data.time });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: '', time: data.time });
                logger.error('get articleList error @id: ' + data.id, err);
            });
    },
    // 文章詳情
    article: function(aid, time) {
        return DcardAPI.getArticle(aid).then(function(article) {
                const data = {
                    id: aid,
                    title: article.title,
                    content: article.content,
                    gender: article.gender,
                    school: article.school || '',
                    department: article.department || '',
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return articleDAO.save(data)
                    .then(function() {
                        // console.log('article over aid ' + aid);
                        return Promise.resolve({ aid: aid, time: time });
                    })
                    .catch(function(err) {
                        logger.error('article save error @aid: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, time: time });
                logger.error('article save error @id: ' + aid, err);
            });
    },
    // 熱門留言
    cmtHot: function(aid, time) {
        return DcardAPI.getHotCmt(aid)
            .then(function(comments) {
                const data = {
                    aid: aid,
                    comments: comments,
                    type: 1,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return commentsDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ aid: aid, time: time });
                    })
                    .catch(function(err) {
                        logger.error('get cmtHot error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, time: time });
                logger.error('Hot comments save error @id: ' + aid, err);
            });
    },
    // 最新留言
    cmtNew: function(aid, time) {
        return DcardAPI.getNewCmt(aid)
            .then(function(comments) {
                const data = {
                    aid: aid,
                    comments: comments,
                    type: 0,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return commentsDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ aid: aid, time: time });
                    })
                    .catch(function(err) {
                        logger.error('get cmtNew error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, time: time });
                logger.error('New comments save error @aid: ' + aid, err);
            });
    },
    // 評論數＆點讚數
    // getArticle 也可以取得評論數＆點讚數
    cmtCount: function(aid, time) {
        return DcardAPI.getArticle(aid).then(function(count) {
                const data = {
                    aid: aid,
                    commentCount: count.commentCount || 0,
                    likeCount: count.likeCount || 0,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return cmtCountDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ aid: aid, time: time });
                    })
                    .catch(function(err) {
                        logger.error('get cmtCount error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, time: time });
                logger.error('comments count save error @aid: ' + aid, err);
            });
    },
    // 看板資訊
    forumsInfo: function() {
        return DcardAPI.getForumsInfo().then(function(forums) {
            const d = forums;
            for (let i = 0, len = d.length; i < len; i++) {
                const data = {
                    forumsAlias: d[i].alias,
                    name: d[i].name,
                    description: d[i].description,
                    subscriptionCount: d[i].subscriptionCount
                };
                forumsDAO.save(data);
            }
        });
    },
    // 最新30篇熱門文章
    latest: function() {
        const dtime = new DateCalc().now(),
            topID = [],
            latestID = [];
        articleDAO.delete({ latest: true })
            .then(function() {
                return latestDAO.delete()
            }).then(function() {
                return DcardAPI.getLatest()
            })
            .then(function(d) {
                const dtime = d.date,
                    stories = d.stories,
                    top = d.top_stories,
                    promiseAll = [];
                for (let i = 0, len = top.length; i < len; i++) {
                    topID.push(top[i].id);
                    const data = {
                        id: top[i].id,
                        title: top[i].title,
                        image: top[i].image,
                        top: true,
                        dtime: dtime
                    };
                    var p = latestDAO.save(data);
                    promiseAll.push(p)
                }
                for (var i = 0, len = stories.length; i < len; i++) {
                    latestID.push(stories[i].id);
                    var data = {
                        id: stories[i].id,
                        title: stories[i].title,
                        image: stories[i].images ? stories[i].images[0] : '',
                        top: false,
                        dtime: dtime
                    };
                    var p = latestDAO.save(data);
                    promiseAll.push(p)
                }
                return Promise.all(promiseAll);
            })
            .then(function() {
                for (let x = 0, xLen = topID.length; x < xLen; x++) {
                    Spider.article(topID[x], dtime, true);
                }
                for (let m = 0, mLen = latestID.length; m < mLen; m++) {
                    Spider.article(latestID[m], dtime, true);
                    DcardAPI.getCmtcount(latestID[m]).then(function(count) {
                        var data = {
                            id: latestID[m],
                            comments: count.comments || 0,
                            popularity: count.popularity || 0,
                            dtime: dtime
                        }
                        latestDAO.save(data);
                    })
                }
            })
            .catch(function(err) {
                logger.error('get lastest data error: ', err);
            })
    },
    // 評論數更新
    updateCmtCount: function(start, end) {
        const aidsArr = [];
        return cmtCountDAO.search({ time: start })
            .then(function(d) {
                if (d.length) {
                    for (let i = 0; i < d.length; i++) {
                        aidsArr.push(d[i].aid);
                    }
                    return cmtCountDAO.delete({ aid: { $in: aidsArr } })
                } else {
                    return Promise.reject('delete over')
                }
            })
            .then(function() {
                // logger.info('delete over @: ' + start);
                const promiseArr = [];
                while (aidsArr.length > 0) {
                    const aid = aidsArr.pop();
                    promiseArr.push(Spider.cmtCount(aid, start));
                }
                return Promise.all(promiseArr);
            })
            .then(function() {
                const date = new DateCalc(start).before();
                if (date != end) {
                    Spider.updateCmtCount(date, end)
                }
                return Promise.resolve(start);
            })
            .catch(function(err) {
                logger.error('CmtCount Update Error : ' + err);
                return Promise.resolve(start);
            })
    },
    // 看板資訊更新
    updateForumsInfo: function() {
        const forumsAliasArr = [];
        return forumsDAO.search({ forumsAlias: { $exists: true } })
            .then(function(d) {
                if (d.length) {
                    for (let i = 0; i < d.length; i++) {
                        forumsAliasArr.push(d[i].forumsAlias);
                    }
                    return forumsDAO.delete({ forumsAlias: { $in: forumsAliasArr } })
                } else {
                    return Promise.reject('Delete over')
                }
            })
            .then(function() {
                // logger.info('delete over @: ' + start);
            })
            .catch(function(err) {
                logger.error('ForumsInfo Update Error : ' + err);
                return Promise.resolve(start);
            })
    }
};
module.exports = Spider;
