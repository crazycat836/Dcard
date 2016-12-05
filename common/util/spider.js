"use strict";
const CronJob = require('cron').CronJob;
const Promise = require('es6-promise').Promise;

const CONFIG = require('../../config/config');

const ArticleDAO = require('../db/models/article');
const ArticlelistDAO = require('../db/models/articlelist');
const CmtCountDAO = require('../db/models/cmtCount');
const CommentsDAO = require('../db/models/comments');
const LatestDAO = require('../db/models/latest');
const ForumsDAO = require('../db/models/forums');

const dcardAPI = require('../api/api');

const DateCalc = require('./date');

const articlelistDAO = new ArticlelistDAO();
const articleDAO = new ArticleDAO();
const cmtCountDAO = new CmtCountDAO();
const commentsDAO = new CommentsDAO();
const latestDAO = new LatestDAO();
const forumsDAO = new ForumsDAO();

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
        return dcardAPI.getAllArticle(articleId).then(function(articlelist) {
            logger.info("start day spider !");
            var d = articlelist,
                promiseAll = [],
                laid = d[d.length - 1].id;
            console.log("last article id = " + laid);
            console.log("d.length = " + d.length);
            console.log("                       ");
            console.log("                       ");
            for (var i = 0, len = d.length; i < len; i++) {
                // 日期重新格式化
                // createdAt: 2016-11-20T10:56:36.075Z
                var createtime = d[i].createdAt;
                console.log("createtime = " + createtime);
                console.log("title = " + d[i].title);
                console.log("=======================");
                var adate = d[i].createdAt.substr(0, 10).split("-").join('');
                var data = {
                    id: d[i].id,
                    title: d[i].title,
                    dtime: adate,
                    dmonth: adate.substr(0, 6),
                    dyear: adate.substr(0, 4)
                };
                var p = Spider.dataOne(data, adate);
                promiseAll.push(p);
            }

            Promise.all(promiseAll).then(function() {
                logger.info('day history data over @: ' + new DateCalc(date).before());
                return Promise.resolve('day history data over @: ' + new DateCalc(date).before());
            }).catch(function(err) {
                logger.error('get ' + hDate + ' data error: ', err);
            });

            //爬完全部熱門文章
            //if (d.length) { Spider.day(laid); }
        });
    },
    dayRefresh: function(dtime) {
        var query = { dtime: dtime };
        return tmpDAO.count({ dtime: dtime })
            .then(function(d) {
                if (d == 0) {
                    return Promise.reject('over');
                } else {
                    return articlelistDAO.delete(query)
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
                Spider.day(new DateCalc(dtime).after())
                    .then(function() {
                        return tmpDAO.delete(query);
                    })
            })
            .catch(function(err) {
                tmpDAO.save({ aid: '', dtime: dtime });
                return Promise.reject(err);
            })
    },
    dataOne: function(data, date) {
        return Spider.articlelist(data)
            .then(function(d) {
                return Spider.article(d.aid, d.dtime);
            })
            .then(function(d) {
                return Spider.cmtHot(d.aid, d.dtime);
            })
            .then(function(d) {
                return Spider.cmtNew(d.aid, d.dtime);
            })
            .then(function(d) {
                return Spider.cmtCount(d.aid, d.dtime);
            })
            .catch(function(e) {
                tmpDAO.save({ aid: '', dtime: data.dtime });
            });
    },
    articlelist: function(data) {
        return articlelistDAO.save(data)
            .then(function(err) {
                return Promise.resolve({ aid: data.id, dtime: data.dtime });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: '', dtime: dtime });
                logger.error('get articlelist error @id: ' + data.id, err);
            });
    },
    // 文章詳情
    article: function(aid, dtime) {
        return dcardAPI.getArticle(aid).then(function(article) {
                var data = {
                    id: aid,
                    title: article.title,
                    content: article.content,
                    gender: article.gender,
                    school: article.school || '',
                    department: article.department || '',
                    dtime: article.createdAt,
                    dmonth: dtime.substr(0, 6),
                    dyear: dtime.substr(0, 4)
                }
                return articleDAO.save(data)
                    .then(function() {
                        //console.log('article over aid ' + aid);
                        return Promise.resolve({ aid: aid, dtime: dtime });
                    })
                    .catch(function(err) {
                        logger.error('article save error @aid: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, dtime: dtime });
                logger.error('article save error @id: ' + aid, err);
            });
    },
    // 熱門留言
    cmtHot: function(aid, dtime) {
        return dcardAPI.getHotCmt(aid)
            .then(function(cmts) {
                var data = {
                    aid: aid,
                    comments: cmts,
                    type: 1,
                    dtime: dtime,
                    dmonth: dtime.substr(0, 6),
                    dyear: dtime.substr(0, 4)
                }
                return commentsDAO.save(data)
                    .then(function(err) {
                        return Promise.resolve({ aid: aid, dtime: dtime });
                    })
                    .catch(function(err) {
                        logger.error('get cmtHot error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, dtime: dtime });
                logger.error('Hot comments save error @id: ' + aid, err);
            });
    },
    // 最新留言
    cmtNew: function(aid, dtime) {
        return dcardAPI.getNewCmt(aid)
            .then(function(cmts) {
                var data = {
                    aid: aid,
                    comments: cmts,
                    type: 0,
                    dtime: dtime,
                    dmonth: dtime.substr(0, 6),
                    dyear: dtime.substr(0, 4)
                }
                return commentsDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ aid: aid, dtime: dtime });
                    })
                    .catch(function(err) {
                        logger.error('get cmtNew error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, dtime: dtime });
                logger.error('New comments save error @aid: ' + aid, err);
            });
    },
    // 評論數＆點讚數
    // getArticle 也可以取得評論數＆點讚數
    cmtCount: function(aid, dtime) {
        return dcardAPI.getArticle(aid).then(function(count) {
                var data = {
                    aid: aid,
                    commentCount: count.commentCount || 0,
                    likeCount: count.likeCount || 0,
                    dtime: dtime,
                    dmonth: dtime.substr(0, 6),
                    dyear: dtime.substr(0, 4)
                }
                return cmtCountDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ aid: aid, dtime: dtime });
                    })
                    .catch(function(err) {
                        logger.error('get cmtCount error @id: ' + aid, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ aid: aid, dtime: dtime });
                logger.error('comments count save error @aid: ' + aid, err);
            });
    },
    //看板資訊
    forumsInfo: function() {
        return dcardAPI.getForumsInfo().then(function(forums) {
            var d = forums;
            for (var i = 0, len = d.length; i < len; i++) {
                var data = {
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
        var dtime = new DateCalc().now(),
            topID = [],
            latestID = [];
        articleDAO.delete({ latest: true })
            .then(function() {
                return latestDAO.delete()
            }).then(function() {
                return dcardAPI.getLatest()
            })
            .then(function(d) {
                var dtime = d.date,
                    stories = d.stories,
                    top = d.top_stories,
                    promiseAll = [];
                for (var i = 0, len = top.length; i < len; i++) {
                    topID.push(top[i].id);
                    var data = {
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
                    dcardAPI.getCmtcount(latestID[m]).then(function(count) {
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
        var aidsArr = [];
        return cmtCountDAO.search({ dtime: start })
            .then(function(d) {
                if (d.length) {
                    for (var i = 0; i < d.length; i++) {
                        aidsArr.push(d[i].aid);
                    }
                    return cmtCountDAO.delete({ aid: { $in: aidsArr } })
                } else {
                    return Promise.reject('delete over')
                }
            })
            .then(function() {
                // logger.info('delete over @: ' + start);
                var promiseArr = [];
                while (aidsArr.length > 0) {
                    var aid = aidsArr.pop();
                    promiseArr.push(Spider.cmtCount(aid, start));
                }
                return Promise.all(promiseArr);
            })
            .then(function() {
                var date = new DateCalc(start).before();
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
    //
    updateForumsInfo: function() {
        var forumsAliasArr = [];
        return forumsDAO.search({ forumsAlias: { $exists: true } })
            .then(function(d) {
                if (d.length) {
                    for (var i = 0; i < d.length; i++) {
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
}
module.exports = Spider;
