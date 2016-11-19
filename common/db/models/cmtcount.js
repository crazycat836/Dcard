// 文章點讚評論數
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var CmtCountSchema = new Schema({
    aid: { type: String, index: true }, // 單篇文章用
    comments: Number,
    popularity: Number,
    dtime: { type: String, index: true }, // 歷史紀錄用
    dmonth: { type: String, index: true }, // 統計用
    dyear: String
});

var CmtCountDAO = function() {};
var CmtCount = mongodb.mongoose.model('CmtCount', CmtCountSchema);

CmtCountDAO.prototype = {
    constructor: CmtCountDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new CmtCount(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            CmtCount.remove(query, function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            CmtCount.find(query, function(err, data) {
                if (err) return reject(err)
                var result = [];
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var d = {
                            aid: data[i].aid,
                            comments: data[i].comments,
                            popularity: data[i].popularity,
                            dtime: data[i].dtime,
                            dmonth: data[i].dmonth,
                            dyear: data[i].dyear
                        }
                        result.push(d);
                    }
                }
                resolve(result);
            });
        });
    }

};

module.exports = CmtCountDAO;
