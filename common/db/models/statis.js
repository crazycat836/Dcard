// 統計用
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var StatisSchema = new Schema({
    type: String, // commentCount(評論數)  likeCount(點讚數)
    sum: Number,
    count: Array, // 按讚和評論前十名
    aids: Array,
    tags: Array, // 前十名 tag
    desc: String,
    gender: String,
    school: Array,
    dmonth: { type: String, index: true },
    dyear: String
});

var StatisDAO = function() {};
var Statis = mongodb.mongoose.model('Statis', StatisSchema);

StatisDAO.prototype = {

    constructor: StatisDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new Statis(obj);
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
                var result = [];
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        d = {
                            type: data[i].type,
                            sum: data[i].sum,
                            count: data[i].count,
                            aids: data[i].aids,
                            tags: data[i].tags,
                            gender: data[i].gender,
                            school: data[i].school,
                            dmonth: data[i].dmonth
                        }
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = StatisDAO;
