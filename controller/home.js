const ArticleDAO = require('../common/db/models/article');
const CmtCountDAO = require('../common/db/models/cmtCount');
const LatestDAO = require('../common/db/models/latest');
const ForumsDAO = require('../common/db/models/forums');

const _ = require('lodash');
const URL = require('url');

const articleDAO = new ArticleDAO();
const cmtCountDAO = new CmtCountDAO();
const latestDAO = new LatestDAO();
const forumsDAO = new ForumsDAO();

const Home = {
    index: function(req, res){
        res.send("hello world!");
        //res.render('index');
    },
    // 抓取最新文章
    getLatest: function(req, res){
        latestDAO.all().then(function(result){
            if(result.length){
                res.json(result)
            }
        })
    },
    // 高人氣文章
    getHotest: function(req, res){
        const aid = req.params.aid;
        if(aid) {
            articleDAO.search({id: aid}).then(function(data){
                if(data.length){
                    const result = data[0];
                    //  HTML实体转换 http://www.cnblogs.com/zichi/p/5135636.html
                    const $ = cheerio.load(result.body, {decodeEntities: false});
                    $('img').each(function(idx, item){
                        $(item).attr('src','http://ccforward.sinaapp.com/api/proxy.php?url=' + $(item).attr('src'))
                    });
                    result.body = $.root().html();
                }
                res.json(result)
            });
        }else {
            res.json([])
        }
    },
    //點讚前十名
    getLikeTop10: function(req, res){
        const aid = req.params.aid;
        if(aid) {
            cmtCountDAO.search({aid:aid}).then(function(result){
                res.json(result.length ? result[0]: {});
            });
        }
    },
    //評論前十名
    getCmtTop10: function(req, res){
        const aid = req.params.aid,
            apiData = [];
        if(aid) {
            zhAPI.getCmtLong(aid)
                .then(function(d){
                    apiData.push(d)
                    return zhAPI.getCmtshort(aid)
                })
                .then(function(d){
                    apiData.push(d)
                    res.json(apiData);
                })
                .catch(function(){
                    res.json([]);
                });
        }else {
            res.json([]);
        }
    },
    //總點讚數
    likeCount: function(req, res){
        const aid = req.params.aid;
        if(aid) {
            commentsDAO.search({aid:aid}).then(function(result){
                res.json(result);
            });
        }else {
            res.json([]);
        }
    },
    //總評論數
    cmtCount: function(req, res){
        const aid = req.params.aid;
        if(aid) {
            commentsDAO.search({aid:aid}).then(function(result){
                res.json(result);
            });
        }else {
            res.json([]);
        }
    },
    school: function(req, res){
        const aid = req.params.aid;
        if(aid) {
            commentsDAO.search({aid:aid}).then(function(result){
                res.json(result);
            });
        }else {
            res.json([]);
        }
    },
    gender: function(req, res){
    const aid = req.params.aid;
    if(aid) {
        commentsDAO.search({aid:aid}).then(function(result){
            res.json(result);
        });
    }else {
        res.json([]);
    }
},
    
};
module.exports = Home;