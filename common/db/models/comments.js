// 文章評論
// 熱門留言：type = 1 
// 最新留言：type = 0 
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const CommentsSchema = new Schema({
    id: { type: String, index: true },
    comments: Array,
    type: Number,
    time: String,
    month: String,
    year: String
});

const CommentsDAO = function() {};
const Comments = mongodb.mongoose.model('Comments', CommentsSchema);

CommentsDAO.prototype = {
    constructor: CommentsDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Comments(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Comments.remove(query, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Comments.find(query, function(err, data) {
                if (err) return reject(err);
                const result = [];
                if (data.length) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        const d = {
                            aid: data[i].aid,
                            comments: data[i].comments,
                            type: data[i].type
                        };
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    }

};

module.exports = CommentsDAO;
