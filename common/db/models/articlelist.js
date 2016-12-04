// 文章清單
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var ArticleListSchema = new Schema({
    id: { type: String, index: true },
    title: String,
    dtime: { type: String, index: true },
    dmonth: String,
    dyear: String
});

var ArticleListDAO = function() {};
var ArticleList = mongodb.mongoose.model('ArticleList', ArticleListSchema);

ArticleListDAO.prototype = {

    constructor: ArticleListDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new ArticleList(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            ArticleList.remove(query, function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });
        });
    },
    count: function(query) {
        return new Promise(function(resolve, reject) {
            ArticleList.count(query, function(err, d) {
                return resolve(d)
            })
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            ArticleList.find(query, function(err, d) {
                if (err) return reject(err)
                var data = [];
                if (d.length > 0) {
                    for (var i = 0, len = d.length; i < len; i++) {
                        var re = {
                            id: d[i].id,
                            title: d[i].title,
                            dtime: d[i].dtime
                        }
                        data.push(re);
                    }
                }
                resolve(data);
            });
        });
    },
    list: function() {
        return new Promise(function(resolve, reject) {
            ArticleList.find(function(err, d) {
                resolve && resolve(d);
            });

        });
    }

};

module.exports = ArticleListDAO;
