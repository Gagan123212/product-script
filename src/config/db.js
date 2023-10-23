const mongose = require("mongoose");

mongose.connect("mongodb://localhost:27017/testdb");

const dbConection = mongose.connection;

module.exports = { dbConection };
