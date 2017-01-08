// 最新 30 篇熱門文章
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const LatestSchema = new Schema({
    id: String,
    title: String,
    latest: Boolean,
    commentCount: Number,
    likeCount: Number,
    time: String,
});

const LatestDAO = function() {};
const Latest = mongodb.mongoose.model('Latest', LatestSchema);

LatestDAO.prototype = {

    constructor: LatestDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Latest(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Latest.remove(query || {}, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    },
    all: function() {
        return new Promise(function(resolve, reject) {
            Latest.find(function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });

        });
    }

};

module.exports = LatestDAO;
