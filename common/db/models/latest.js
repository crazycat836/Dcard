// 最新 30 篇熱門文章
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var LatestSchema = new Schema({
    id: String,
    title: String,
    top: Boolean,
    commentCount: Number,
    likeCount: Number,
    dtime: String,
});

var LatestDAO = function() {};
var Latest = mongodb.mongoose.model('Latest', LatestSchema);

LatestDAO.prototype = {

    constructor: LatestDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new Latest(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Latest.remove(query || {}, function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });
        });
    },
    all: function() {
        return new Promise(function(resolve, reject) {
            Latest.find(function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });

        });
    }

};

module.exports = LatestDAO;
