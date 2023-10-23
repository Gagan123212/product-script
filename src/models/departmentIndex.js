const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countSchema = new Schema({
     name:{type: String,default: 'department'},
     number:{type: Number,default:0}
}, { timestamps: true });

const countDepartment = module.exports = mongoose.model('department_positions', countSchema, 'department_positions');

