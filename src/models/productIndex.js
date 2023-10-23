

const mongoose = require('mongoose');

let weeklyProductTopdawgSchema = mongoose.Schema({
    name: { type: String, defaut: "index" },
    count: { type: Number },
    id:{type: String},
    error_message:{type: String}
},
    {
        versionKey: false
    });

const weeklyProductTopdawg = module.exports = mongoose.model('productindex', weeklyProductTopdawgSchema, 'productindex');






