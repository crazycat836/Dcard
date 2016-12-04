//  文章詳情
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var ArticleSchema = new Schema({
    id: { type: String, index: true },
    title: String,
    content: String,
    gender: String,
    school: String,
    department: String,
    dtime: String,
    dmonth: String,
    dyear: String
});

var ArticleDAO = function() {};
var Article = mongodb.mongoose.model('Article', ArticleSchema);

ArticleDAO.prototype = {

    constructor: ArticleDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new Article(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Article.remove(query, function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Article.find(query, function(err, data) {
                if (err) return reject(err)
                var result = [];
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        d = {
                            id: data[i].id,
                            title: data[i].title,
                            content: data[i].content,
                            gender: data[i].gender,
                            school: data[i].school,
                            department: data[i].department,
                            dtime: data[i].dtime,
                            dmonth: data[i].dmonth,
                            dyear: data[i].dyear
                        }
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = ArticleDAO;
