const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countSchema = new Schema({
     name:{type: String,default: 'section'},
     number:{type: Number,default:0}
}, { timestamps: true });

const countSections = module.exports = mongoose.model('section_positions', countSchema, 'section_positions');

