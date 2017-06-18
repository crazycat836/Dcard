"use strict";

const ArticleDAO = require('../db/models/article');
const ArticleListDAO = require('../db/models/articlelist');
const CmtCountDAO = require('../db/models/cmtCount');
const CommentsDAO = require('../db/models/comments');
const LatestDAO = require('../db/models/latest');
const ForumsDAO = require('../db/models/forums');
const TmpDAO = require('../db/models/tmp');
const TagDAO = require('../db/models/tag');

const DcardAPI = require('../api/api');

const Producer = require('./producer');
const DateCalc = require('./date');
const date = new DateCalc();

const articleListDAO = new ArticleListDAO();
const articleDAO = new ArticleDAO();
const cmtCountDAO = new CmtCountDAO();
const commentsDAO = new CommentsDAO();
const latestDAO = new LatestDAO();
const forumsDAO = new ForumsDAO();
const tmpDAO = new TmpDAO();
const tagDAO = new TagDAO();

const logger = require('log4js').getLogger('access');

const Spider = {
    // 爬完當天文章
    day: function() {
        return DcardAPI.getHot()
            .then(function(hotArticle) {
                logger.info("Start Day Spider!");
                const d = hotArticle,
                    lid = d[d.length - 1].id,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    // 日期重新格式化
                    // createdAt: 2016-11-20T10:56:36.075Z
                    const date = d[i].createdAt.substr(0, 10).split("-").join('');
                    const data = {
                        id: d[i].id,
                        time: date,
                        month: date.substr(0, 6),
                        year: date.substr(0, 4)
                    };
                    Spider.dataOne(data);
                }
                return Promise.resolve(lid);
            })
            .then(function(d) {
                Spider.fire(d);
            });
    },
    fire: function(articleId) {
        return DcardAPI.getAllArticle(articleId)
            .then(function(articleAll) {
                const d = articleAll,
                    lid = d[d.length - 1].id,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    // 日期重新格式化
                    // createdAt: 2016-11-20T10:56:36.075Z
                    const date = d[i].createdAt.substr(0, 10).split("-").join('');
                    const data = {
                        id: d[i].id,
                        time: date,
                        month: date.substr(0, 6),
                        year: date.substr(0, 4)
                    };
                    Spider.dataOne(data);
                }
                return Promise.resolve({ lid: lid, length: length });
            })
            .then(function(d) {
                if (d.length == 30) {
                    Spider.fire(d.lid);
                } else {
                    return Promise.resolve(logger.info('Article Save Complete !'));
                }
            });
    },
    dataOne: function(d) {
        return Spider.articleList(d)
            .then(function(d) {
                return Spider.article(d.id, d.time);
            })
            .then(function(d) {
                return Spider.cmtHot(d.id, d.time);
            })
            .then(function(d) {
                return Spider.cmtNew(d.id, d.time);
            })
            .then(function(d) {
                return Spider.cmtCount(d.id, d.time);
            })
            .then(function(d) {
                return Spider.tag(d.id, d.time);
            })
            .catch(function(err) {
                logger.error('Get DataOne Error: ' + err);
            });
    },
    // 文章清單
    articleList: function(d) {
        return articleListDAO.save(d)
            .then(function() {
                return Promise.resolve({ id: d.id, time: d.time });
            })
            .catch(function(err) {
                tmpDAO.save({ id: d.id, time: time });
                logger.error('ArticleList Save Error @id: ' + d.id, err);
            });
    },
    // 文章詳情
    article: function(id, time) {
        return DcardAPI.getArticle(id)
            .then(function(article) {
                const data = {
                    id: id,
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
                        return Promise.resolve({ id: id, time: time });
                    })
                    .catch(function(err) {
                        logger.error('Article Save Error @id: ' + id, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ id: id, time: time });
                logger.error('Get Article Error @id: ' + id, err);
            });
    },
    // 熱門留言
    cmtHot: function(id, time) {
        return DcardAPI.getHotCmt(id)
            .then(function(comments) {
                const data = {
                    id: id,
                    comments: comments,
                    type: 1,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return commentsDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ id: id, time: time });
                    })
                    .catch(function(err) {
                        logger.error('CmtHot Save Error @id: ' + id, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ id: id, time: time });
                logger.error('Get CmtHotError @id: ' + id, err);
            });
    },
    // 最新留言
    cmtNew: function(id, time) {
        return DcardAPI.getNewCmt(id)
            .then(function(comments) {
                const data = {
                    id: id,
                    comments: comments,
                    type: 0,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return commentsDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ id: id, time: time });
                    })
                    .catch(function(err) {
                        logger.error('CmtNew Save Error @id: ' + id, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ id: id, time: time });
                logger.error('Get CmtNew Error @id: ' + id, err);
            });
    },
    // 評論數＆點讚數
    // getArticle 也可以取得評論數＆點讚數
    cmtCount: function(id, time) {
        return DcardAPI.getArticle(id).then(function(count) {
                const data = {
                    id: id,
                    commentCount: count.commentCount || 0,
                    likeCount: count.likeCount || 0,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return cmtCountDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ id: id, time: time });
                    })
                    .catch(function(err) {
                        logger.error('CmtCount Save Error @id: ' + id, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ id: id, time: time });
                logger.error('Get CmtCount Error @id: ' + id, err);
            });
    },
    // 文章 tag
    tag: function(id, time) {
        return DcardAPI.getTag(id)
            .then(function(d) {
                const data = {
                    id: d.id,
                    tags: d.tags,
                    time: time,
                    month: time.substr(0, 6),
                    year: time.substr(0, 4)
                };
                return tagDAO.save(data)
                    .then(function() {
                        return Promise.resolve({ id: id, time: time });
                    })
                    .catch(function(err) {
                        logger.error('Tags Save Error @id: ' + id, err);
                    });
            })
            .catch(function(err) {
                tmpDAO.save({ id: id, time: time });
                logger.error('Get Tags Error @id: ' + id, err);
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
        latestDAO.delete({ latest: true })
            .then(function() {
                return latestDAO.delete()
            })
            .then(function() {
                return DcardAPI.getHot();
            })
            .then(function(hotArticle) {
                const d = hotArticle,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    // 日期重新格式化
                    // createdAt: 2016-11-20T10:56:36.075Z
                    const date = d[i].createdAt.substr(0, 10).split("-").join('');
                    const data = {
                        id: d[i].id,
                        title: d[i].title,
                        latest: true,
                        commentCount: d[i].commentCount,
                        likeCount: d[i].likeCount,
                        time: date
                    };
                    latestDAO.save(data);
                }
                return logger.info('Latest Save Complete !')
            })
            .catch(function(err) {
                logger.error('Get Latest Data Error: ', err);
            });
    },
    // 評論數更新
    updateCmtCount: function(start, end) {
        const idsArr = [];
        return cmtCountDAO.search({ time: start })
            .then(function(d) {
                if (d.length) {
                    for (let i = 0; i < d.length; i++) {
                        idsArr.push(d[i].id);
                    }
                    return cmtCountDAO.delete({ id: { $in: idsArr } })
                } else {
                    return Promise.reject('Delete Over')
                }
            })
            .then(function() {
                // logger.info('delete over @: ' + start);
                while (idsArr.length) {
                    const id = idsArr.pop();
                    Spider.cmtCount(id, start);
                }
            })
            .then(function() {
                const d = new DateCalc(start).before();
                if (d != end) {
                    Spider.updateCmtCount(d, end)
                }
                return Promise.resolve(start);
            })
            .catch(function(err) {
                logger.error('CmtCount Update Error : ' + err);
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
                    return Promise.resolve('Delete Over')
                }
            })
            .then(function() {
                logger.info('Delete Over! Start Update ForumsInfo');
                Spider.forumsInfo();
            })
            .catch(function(err) {
                logger.warn('ForumsInfo Update Error : ' + err);
                return Promise.resolve(start);
            });
    },
    // 更新每日錯誤資料
    dayRefresh: function() {
        const idsArr = [];
        const dArr = [];
        const query = { id: { $in: idsArr } };
        return tmpDAO.search({ id: { $exists: true } })
            .then(function(d) {
                if (d.length) {
                    for (let i = 0; i < d.length; i++) {
                        idsArr.push(d[i].id);
                        dArr.push({ id: d[i].id, time: d[i].time });
                    }
                    return tmpDAO.delete(query)
                } else {
                    return Promise.reject('No Data Need To Refresh !')
                }
            })
            .then(function() {
                return articleListDAO.delete(query);
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
                return tagDAO.delete(query);
            })
            .then(function() {
                logger.info('Delete Over ');
                const promiseArr = [];
                while (dArr.length) {
                    const d = dArr.pop();
                    idsArr.pop();
                    promiseArr.push(Spider.dataOne(d));
                }
                return Promise.all(promiseArr);
            })
            .then(function() {
                logger.info('DayRefresh Update Success ');
                return Promise.resolve('DayRefresh Update Success ');
            })
            .catch(function(err) {
                //tmpDAO.save({ id: '', time: time });
                logger.error('DayRefresh Update Error : ' + err);
            })
    },
    // 將資料傳進 kafka
    kafkaTag: function(id) {
        return DcardAPI.getTag(id)
            .then(function(d) {
                const data = {
                    id: d.id,
                    tags: d.tags
                };
                //console.log("id: "+data.id+" tags: "+data.tags);
                return Promise.resolve(data.tags)
            })
            .then(function(d) {
                if(d.length)
                {Producer.Stream(d);}
            })
            .catch(function() {
                logger.error('Kafka Tags Error @id: ' + id);
            });
    },
    // 以熱門文章抓取 tag
    streamTag: function() {
        return DcardAPI.getHot()
            .then(function(hotArticle) {
                const d = hotArticle,
                    lid = d[d.length - 1].id,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    const data = {
                        id: d[i].id,
                    };
                    Spider.kafkaTag(data.id);
                }
                return Promise.resolve(lid);
            })
            .then(function(d) {
               Spider.tagFire(d);
            })
            .catch(function(err) {
                logger.error('Get Latest List Data Error: ', err);
            });
    },
    tagFire: function(articleId) {
        return DcardAPI.getAllArticle(articleId)
            .then(function(articleAll) {
                const d = articleAll,
                    lid = d[d.length - 1].id,
                    length = d.length;
                for (let i = 0, len = length; i < len; i++) {
                    const data = {
                        id: d[i].id,
                    };
                    Spider.kafkaTag(data.id);
                }
                return Promise.resolve({ lid: lid, length: length });
            })
            .then(function(d) {
                if (d.length == 30) {
                    Spider.tagFire(d.lid);
                } else {
                    return Promise.resolve(logger.info('Tag Save Complete !'));
                }
            });
    },
};
module.exports = Spider;
