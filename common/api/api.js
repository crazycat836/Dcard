const Promise = require('es6-promise').Promise;
const request = require('request');
const config = require('../../config/config');

const API = {
    'forumsInfo': 'https://www.dcard.tw/_api/forums',
    'article': 'https://www.dcard.tw/_api/posts/',
    'hot': 'https://www.dcard.tw/_api/posts?popular=true',
    'comments': 'https://www.dcard.tw/_api/posts/',
    'hotcmt': 'https://www.dcard.tw/_api/posts/',
    'allArticle': 'https://www.dcard.tw/_api/posts?popular=true&before='
};

const data = {
    // 看板資訊
    getForumsInfo: function() {
        return new Promise(function(resolve, reject) {
            const url = API.forumsInfo;
            request({
                method: 'GET',
                uri: url,
                headers: { 'Authorization': config.auth }
            }, function(err, response, body) {
                //const forumsInfo = [];
                if (err) {
                    return reject(err)
                } else {
                    const forumsInfo = JSON.parse(body);
                    resolve(forumsInfo);
                }
            });

        });
    },
    // 所有熱門文章列表
    getAllArticle: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                const url = API.allArticle + articleId;
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
    // 熱門文章列表
    getHot: function() {
        return new Promise(function(resolve, reject) {
            const url = API.hot;
            request({
                method: 'GET',
                uri: url,
                headers: { 'Authorization': config.auth }
            }, function(err, response, body) {
                const hotArticle = null;
                if (!err) {
                    const hotArticle = JSON.parse(body);
                    resolve(hotArticle);
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
                const url = API.article + articleId;
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
    // 評論
    getNewCmt: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                const url = API.comments + articleId + '/comments';
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
    getHotCmt: function(articleId) {
        return new Promise(function(resolve, reject) {
            if (articleId) {
                const url = API.hotcmt + articleId + '/comments?popular=true';
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
};

module.exports = data;
