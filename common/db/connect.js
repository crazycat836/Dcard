const mongoose = require('mongoose');

const config = require('../../config/config').mongo;

const dbUrl = config.url();
const dbOption = config.mongoOptions;

// Use bluebird
mongoose.Promise = require('bluebird');

mongoose.connect(dbUrl, dbOption);

exports.mongoose = mongoose;