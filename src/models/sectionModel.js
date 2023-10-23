const mongoose = require('mongoose');
let slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

let sectionSchema = mongoose.Schema({
    sectionName: { type: String, required: true },
    image:{type: String},
    department: [{ type: mongoose.Schema.Types.ObjectId, ref: 'departments' }],
    nameWithoutSpace:{type: String, tirm: true},
    categories:[],
    sectionDesc: { type: String, required: true },
    slug: { type: String, slug: "sectionName", lowercase: true },
    status: { type: String, enum: ["active", "inactive", "archived"], default: "active" },
    position:{type: Number},
    date_created: { type: Date, default: new Date() },
    date_created_utc: { type: Date, default: new Date() },
    date_modified: { type: Date, default: new Date() },
    date_modified_utc: { type: Date, default: new Date() },
    meta_data: [
        {
            key: { type: String },
            value: { type: String }
        }
    ]
},
    {
        versionKey: false
    });

const SectionTable = module.exports = mongoose.model('sections', sectionSchema,'sections');

module.exports.getSections = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    SectionTable.aggregate([
        { $match: obj },
        {$lookup:{from:"departments", localField:"department", foreignField:"_id", as:"department"}},
        { $sort: { position: 1 } }, 
        // { $sort: { [sortByField]: parseInt(sortOrder) } },
        { $skip: (paged - 1) * pageSize },
        { $limit: parseInt(pageSize) },
    ], callback);
}

//add department
module.exports.addSection = function (data, callback) {
    data.date_created_utc = new Date();
    let query = {nameWithoutSpace: data.nameWithoutSpace}
    SectionTable.findOneAndUpdate(query,data,{upsert: true, new: true},callback);
}

//update department
module.exports.updateSection = function (data, callback) {
    var query = { _id: data._id }
    SectionTable.findOneAndUpdate(query, data, { new: true }, callback);
}

module.exports.updateStatusByIds = (data, update, callback) => {
    let query = { _id: { $in: data._id } }
    SectionTable.updateMany(query, update, { "new": true }, callback);
}


module.exports.getSectionById = (id, callback) => {
    SectionTable.findById(id).populate('department')
        .exec(callback);
}


//remove department
module.exports.removeSection = (id, callback) => {
    var query = { _id: id };
    SectionTable.deleteOne(query, callback);
}

module.exports.getSectionList = function (data,callback) {
    SectionTable.find({department:{$in: data.departmentId}}).sort({ position: 1 }).exec(callback);
}

module.exports.getSectionsAll = function (obj) {
   return SectionTable.aggregate([
        { $match: obj },
        {$lookup:{from:"departments", localField:"department", foreignField:"_id", as:"department"}}
    ]);
}



