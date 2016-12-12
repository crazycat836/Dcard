// 文章評論
// 熱門留言：type = 1 
// 最新留言：type = 0 
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var CommentsSchema = new Schema({
    aid: { type: String, index: true },
    comments: Array,
    type: Number,
    time: String,
    month: String,
    year: String
});

var CommentsDAO = function() {};
var Comments = mongodb.mongoose.model('Comments', CommentsSchema);

CommentsDAO.prototype = {
    constructor: CommentsDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new Comments(obj);
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
                var result = [];
                if (data.length) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var d = {
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
