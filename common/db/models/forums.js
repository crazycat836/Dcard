// 看板詳情
const mongodb = require('../connect');
const Schema = mongodb.mongoose.Schema;

const ForumsSchema = new Schema({
    forumsAlias: { type: String, index: true },
    name: String,
    description: String,
    subscriptionCount: String
});

const ForumsDAO = function() {};
const Forums = mongodb.mongoose.model('Forums', ForumsSchema);

ForumsDAO.prototype = {

    constructor: ForumsDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            const instance = new Forums(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Forums.remove(query, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Forums.find(query, function(err, data) {
                if (err) return reject(err);
                const result = [];
                if (data) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        d = {
                            forumsAlias: data[i].forumsAlias,
                            name: data[i].name,
                            description: data[i].description,
                            subscriptionCount: data[i].subscriptionCount
                        };
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = ForumsDAO;
