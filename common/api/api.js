var Promise = require('es6-promise').Promise;
var request = require('request');
var config = require('../../config/config');

var API = {
    'forumsInfo': 'https://www.dcard.tw/_api/forums',
    'article': 'https://www.dcard.tw/_api/posts/',
    'hot': 'https://www.dcard.tw/_api/posts?popular=true',
    'comments': 'https://www.dcard.tw/_api/posts',
    'allHot': 'https://www.dcard.tw/_api/posts?popular=true&before=',
    'hotcmt': 'https://www.dcard.tw/_api/posts/'
}

var data = {
    // 看板資訊
    getForumsInfo: function() {
        var url = API.forumsInfo;
        return new Promise(function(resolve, reject) {
            request({
                method: 'GET',
                uri: url,
                headers: { 'Authorization': config.auth }
            }, function(err, response, body) {
                var forumsInfo = null;
                if (!err) {
                    var forumsInfo = JSON.parse(body);
                    resolve(forumsInfo);
                } else {
                    return reject(err)
                }
            });

        });
    },
    // 文章詳情
    getArticle: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                var url = API.article + articleId;
                request({
                    method: 'GET',
                    uri: url,
                    headers: { 'Authorization': config.auth }
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            } else {
                reject(null);
            }
        })
    },
    // 熱門文章
    getHot: function() {
        var url = API.hot;
        return new Promise(function(resolve, reject) {
            request({
                method: 'GET',
                uri: url,
                headers: { 'Authorization': config.auth }
            }, function(err, response, body) {
                var hotArticle = null;
                if (!err) {
                    var hotArticle = JSON.parse(body);
                    resolve(hotArticle);
                } else {
                    return reject(err)
                }
            });

        });
    },
    // 需要修改  評論
    getComments: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                var url = API.cmtLong + articleId + '/comments';
                request({
                    method: 'GET',
                    uri: url,
                    headers: { 'Authorization': config.auth }
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            } else {
                reject(null);
            }

        });
    },
    // 所有熱門文章
    getAllHot: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                var url = API.allHot + articleId;
                request({
                    method: 'GET',
                    uri: url,
                    headers: { 'Authorization': config.auth }
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            } else {
                reject(null);
            }

        });
    },
    // 熱門評論
    getHotcmt: function(date) {
        return new Promise(function(resolve, reject) {
            if (date) {
                var url = API.hotcmt + articleId+'/comments?popular=true';
                request({
                    method: 'GET',
                    uri: url,
                    headers: { 'Authorization': config.auth }
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            } else {
                reject(null);
            }

        });
    }
}

module.exports = data;
