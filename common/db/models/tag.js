// 文章 tag
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;
const Promise = require('es6-promise').Promise;

const TagSchema = new Schema({
    id: { type: String, index: true },
    tags: [String],
    time: String,
    month: String
});

const TagDAO = function() {};
const Tag = mongodb.mongoose.model('Tag', TagSchema);

TagDAO.prototype = {

    constructor: TagDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Tag(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Tag.remove(query, function(err, d) {
                if (err) return reject(err);
                resolve(d);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Tag.find(query, function(err, d) {
                if (err) return reject(err);
                const data = [];
                if (d.length > 0) {
                    for (let i = 0, len = d.length; i < len; i++) {
                        const re = {
                            id: d[i].id,
                            tags: d[i].tags,
                            time: d[i].time,
                            month: d[i].month
                        };
                        data.push(re);
                    }
                }
                resolve(data);
            });
        });
    }

};

module.exports = TagDAO;
