// 文章清單
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const ArticleListSchema = new Schema({
    id: { type: String, index: true },
    title: String,
    time: { type: String, index: true },
    month: String,
    year: String
});

const ArticleListDAO = function() {};
const ArticleList = mongodb.mongoose.model('ArticleList', ArticleListSchema);

ArticleListDAO.prototype = {

    constructor: ArticleListDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new ArticleList(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            ArticleList.remove(query, function(err, data) {
                if (err) return reject(err);
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
                if (err) return reject(err);
                const data = [];
                if (d.length > 0) {
                    for (let i = 0, len = d.length; i < len; i++) {
                        const re = {
                            id: d[i].id,
                            title: d[i].title,
                            time: d[i].time
                        };
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
