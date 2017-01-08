// 統計用
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const StatisSchema = new Schema({
    type: String, // commentCount(評論數)  likeCount(點讚數)
    sum: Number,
    count: Array, // 按讚和評論前十名
    ids: Array,
    tags: Array, // 前十名 tag
    desc: String,
    gender: String,
    school: Array,
    month: { type: String, index: true },
    year: String
});

const StatisDAO = function() {};
const Statis = mongodb.mongoose.model('Statis', StatisSchema);

StatisDAO.prototype = {

    constructor: StatisDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Statis(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    count: function(query) {
        return new Promise(function(resolve, reject) {
            Statis.count(query, function(err, d) {
                return resolve(d)
            })
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Statis.find(query, function(err, data) {
                if (err) return reject(err)
                const result = [];
                if (data) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        const d = {
                            type: data[i].type,
                            sum: data[i].sum,
                            count: data[i].count,
                            aids: data[i].aids,
                            tags: data[i].tags,
                            gender: data[i].gender,
                            school: data[i].school,
                            month: data[i].month
                        };
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = StatisDAO;
