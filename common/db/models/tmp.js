const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const TmpSchema = new Schema({
    id: String,
    time: String
});

const TmpDAO = function() {};
const Tmp = mongodb.mongoose.model('Tmp', TmpSchema);

TmpDAO.prototype = {
    constructor: TmpDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Tmp(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Tmp.remove(query, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    },
    count: function(query) {
        return new Promise(function(resolve, reject) {
            Tmp.count(query, function(err, d) {
                if (err) return reject(err);
                return resolve(d)
            })
        });
    },
    list: function() {
        return new Promise(function(resolve, reject) {
            Tmp.find(function(err, d) {
                resolve && resolve(d);
            });

        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Tmp.find(query, function(err, d) {
                if (err) return reject(err);
                const data = [];
                if (d.length > 0) {
                    for (let i = 0, len = d.length; i < len; i++) {
                        const re = {
                            id: d[i].aid,
                            time: d[i].time
                        };
                        data.push(re);
                    }
                }
                resolve(data);
            });
        });
    }

};

module.exports = TmpDAO;
