// forum list
var mongodb = require('../connect');
var Schema = mongodb.mongoose.Schema;
var Promise = require('es6-promise').Promise;

var ForumsSchema = new Schema({
    forumsAlias: { type: String, index: true },
    name: String,
    description: String,
    subscriptionCount: String
});

var ForumsDAO = function() {};
var Forums = mongodb.mongoose.model('Forums', ForumsSchema);

ForumsDAO.prototype = {

    constructor: ForumsDAO,
    save: function(obj) {
        return new Promise(function(resolve, reject) {
            var instance = new Forums(obj);
            instance.save(function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    },
    delete: function(query) {
        return new Promise(function(resolve, reject) {
            Forums.remove(query, function(err, data) {
                if (err) return reject(err)
                resolve(data);
            });
        });
    },
    search: function(query) {
        return new Promise(function(resolve, reject) {
            Forums.find(query, function(err, data) {
                if (err) return reject(err)
                var result = [];
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        d = {
                            forumsid: data[i].forumsid,
                            name: data[i].name,
                            description: data[i].description,
                            subscriptionCount: data[i].subscriptionCount,
                        }
                        result.push(d)
                    }
                }
                resolve(result);
            });
        });
    },

};

module.exports = ForumsDAO;
