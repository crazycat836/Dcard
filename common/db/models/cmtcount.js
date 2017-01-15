// 文章按讚和評論數
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const CmtCountSchema = new Schema({
    id: { type: String, index: true }, // 單篇文章用
    commentCount: Number,
    likeCount: Number,
    time: { type: String, index: true }, // 歷史紀錄用
    month: { type: String, index: true }, // 統計用
    year: String
});

const CmtCountDAO = function() {};
const CmtCount = mongodb.mongoose.model('CmtCount', CmtCountSchema);

CmtCountDAO.prototype = {
    constructor: CmtCountDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new CmtCount(obj);
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
                if (err) return reject(err);
                const result = [];
                if (data) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        const d = {
                            id: data[i].id,
                            commentCount: data[i].commentCount,
                            likeCount: data[i].likeCount,
                            time: data[i].time,
                            month: data[i].month,
                            year: data[i].year
                        };
                        result.push(d);
                    }
                }
                resolve(result);
            });
        });
    }

};

module.exports = CmtCountDAO;
