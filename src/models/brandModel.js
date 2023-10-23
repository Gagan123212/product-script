const mongoose = require('mongoose');
let slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

let brandSchema = mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    nameWithoutSpace: { type: String, trim: true },
    logo: { type: String },
    sections: [],
    slug: { type: String, slug: "name", lowercase: true },
    status: { type: String, enum: ["active", "inactive", "archived"], default: "active" },
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

const BrandTable = module.exports = mongoose.model('brands', brandSchema, 'brands');

module.exports.getBrands = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    BrandTable.aggregate([
        { $match: obj },
        { $sort: { [sortByField]: parseInt(sortOrder) } }, { $skip: (paged - 1) * pageSize },
        { $limit: parseInt(pageSize) },
    ], callback);
}

module.exports.uniqueBrand = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    BrandTable.aggregate([
        { $match: obj },
        {
            $group: {
                _id: "$name",
                slug: { $first: "$slug" },
                authorId: { $first: "$authorId" },
                name: { $first: "$name" },
                status: { $first: "$status" }
            }
        },
        { $sort: { [sortByField]: parseInt(sortOrder) } }, { $skip: (paged - 1) * pageSize },
        { $limit: parseInt(pageSize) },
    ], callback);
}

//add department
module.exports.addBrand = function (data, callback) {
    data.date_created_utc = new Date();
    let query = { nameWithoutSpace: data.nameWithoutSpace };
    BrandTable.findOneAndUpdate(query, data, { upsert: true, new: true }, callback);
}

//update department
module.exports.updateBrand = function (data, callback) {
    var query = { _id: data._id }
    BrandTable.findOneAndUpdate(query, data, { new: true }, callback);
}

module.exports.updateStatusByIds = (data, update, callback) => {
    let query = { _id: { $in: data._id } }
    DepartmentTable.updateMany(query, update, { "new": true }, callback);
}


module.exports.getBrandById = (id, callback) => {
    BrandTable.findById(id)
        .exec(callback);
}


//remove department
module.exports.removeBrand = (id, callback) => {
    var query = { _id: id };
    BrandTable.remove(query, callback);
}

module.exports.getBrandList = function (callback) {
    BrandTable.find({}).exec(callback);
}


module.exports.getBrandsAll = function (obj) {
    return BrandTable.aggregate([
        { $match: obj }
    ]);
}