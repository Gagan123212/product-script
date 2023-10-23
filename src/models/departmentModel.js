const mongoose = require('mongoose');
let slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

let departmentSchema = mongoose.Schema({
    depName: { type: String, required: true },
    image:{ type: mongoose.Schema.Types.ObjectId, ref: "File" },
    nameWithoutSpace:{type: String,trim: true},
    depDesc: { type: String, required: true },
    sections:[],
    slug: { type: String, slug: "depName", lowercase: true },
    status: { type: String, enum: ["active", "inactive", "archived"], default: "active" },
    date_created: { type: Date, default: new Date() },
    date_created_utc: { type: Date, default: new Date() },
    position:{type: Number},
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

const DepartmentTable = module.exports = mongoose.model('departments', departmentSchema,'departments');

module.exports.getDepartments = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    DepartmentTable.aggregate([
        { $match: obj },
        {
            $lookup: {
              from: "files",
              localField: "image",
              foreignField: "_id",
              as: "image",
            }
       },
       {
        $unwind: { path: "$image", preserveNullAndEmptyArrays: true },
      },
        { $sort: { position: 1 } }, 
        { $skip: (paged - 1) * pageSize },
        { $limit: parseInt(pageSize) },
    ], callback);
}

//add department
module.exports.addDepartment = function (data, callback) {
    data.date_created_utc = new Date();
    let query = {nameWithoutSpace: data.nameWithoutSpace};
    DepartmentTable.findOneAndUpdate(query,data,{upsert: true, new: true},callback);
}

//update department
module.exports.updateDepartment = function (data, callback) {
    var query = { _id: data._id }
    DepartmentTable.findOneAndUpdate(query, data, { new: true }, callback);
}

module.exports.updateStatusByIds = (data, update, callback) => {
    let query = { _id: { $in: data._id } }
    DepartmentTable.updateMany(query, update, { "new": true }, callback);
}


module.exports.getDepartmentById = (id, callback) => {
    DepartmentTable.findById(id)
        .populate('image')
        .exec(callback);
}


//remove department
module.exports.removeDepartment = (id, callback) => {
    var query = { _id: id };
    DepartmentTable.remove(query, callback);
}

module.exports.getDepartmentList = function (callback) {
    DepartmentTable.find({}).populate('image').sort({ position: 1 }).exec(callback);
}


module.exports.getDepartmentsAll = function (obj) {
   return DepartmentTable.aggregate([
        { $match: obj },
            {
                $lookup: {
                  from: "files",
                  localField: "image",
                  foreignField: "_id",
                  as: "image",
                }
        }
    ]);
}


