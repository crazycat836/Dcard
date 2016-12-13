const mongoose = require('mongoose');

const config = require('../../config/config').mongo;

const dbUrl = config.url();
const dbOption = config.mongoOptions;
mongoose.connect(dbUrl, dbOption);

exports.mongoose = mongoose;