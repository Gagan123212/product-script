const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countSchema = new Schema({
     name:{type: String,default: 'category'},
     number:{type: Number,default:0}
}, { timestamps: true });

const countCategory = module.exports = mongoose.model('category_positions', countSchema, 'category_positions');

