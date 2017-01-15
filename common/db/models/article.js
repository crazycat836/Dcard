//  文章詳情
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const ArticleSchema = new Schema({
    id: { type: String, index: true },
    title: String,
    content: String,
    gender: String,
    school: String,
    department: String,
    time: String,
    month: String,
    year: String
});

const ArticleDAO = function() {};
const Article = mongodb.mongoose.model('Article', ArticleSchema);

ArticleDAO.prototype = {

    constructor: ArticleDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Article(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Article.remove(query, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Article.find(query, function(err, data) {
                if (err) return reject(err);
                const result = [];
                if (data) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        const d = {
                            id: data[i].id,
                            title: data[i].title,
                            content: data[i].content,
                            gender: data[i].gender,
                            school: data[i].school,
                            department: data[i].department,
                            time: data[i].time,
                            month: data[i].month,
                            year: data[i].year
                        };
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = ArticleDAO;
