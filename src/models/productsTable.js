const mongoose = require("mongoose")
const constants = require('../../../config/constants.json')
const ObjectId = require('objectid')
let slug = require("mongoose-slug-updater")
mongoose.plugin(slug)

let productSchema = mongoose.Schema(
  {
    storeType: { type: mongoose.Schema.Types.ObjectId, ref: "storeType" },
    displayName:{type: String, default:""},
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "shops", default: null },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: [{ type: mongoose.Schema.Types.ObjectId, ref: "departments" }],

    brand: [{ type: mongoose.Schema.Types.ObjectId, ref: "brands" }],
    section: [{ type: mongoose.Schema.Types.ObjectId, ref: "sections" }],
    name: { type: String, required: true, trim: true },
    slug: { type: String, slug: "name", lowercase: true, trim: true },
    type: { type: String, enum: ["simple", "variable"] },
    product: { type: String }, // old  new
    veganType: { type: String, enum: ["veg", "nonveg"], default: "veg" },
    average: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    compare_price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "approved", "inactive", "archived", "block"],
      default: "active"
    },
    is_fave: { type: Boolean },
    isFeatured: { type: Boolean },
    short_description: { type: String },
    api_type: { type: String, enum: ["home_api", "external_api", "csv_api"], default: "home_api" },
    description: { type: String, trim: true },
    sku: { type: String },
    tax: { type: Number, default: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "categoryes" }],
    tegs: { type: Array, default: [] },
    // brand: { type: mongoose.Schema.Types.ObjectId, ref: "Cuisine" },
    manage_stock: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    expeditedOption: { type: Boolean, default: false },
    // expeditedType: { type: String, enum: ["flat", "percent"], default: "unit" },
    expeditedType: { type: String, default: "unit" },
    isMetamallProduct: { type: Boolean, default: false },
    tdid:{type: String},
    expeditedValue: { type: String },
    stock_quantity: { type: Number },
    serviceTime: { type: Number, default: 0 },
    pricingType: { type: String, enum: constants.pricingType_enum, default: "unit" },

    weightDimensions: [],
    specifications: [],
    tags:{type: []},
    upcId: { type: String },
    stock_status: {
      type: String,
      enum: ["instock", "outofstock"],
      default: "instock",
    },
    total_sales: { type: Number }, 
    featured_image: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    obj_fbx: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    obj_fbx_image: {},
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
    attributes: [],
    related_products: { type: Array, default: [] },
    variations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "productVariation" },
    ],
    acceptReturn: { type: Boolean, default: false },
    returnDays: { type: String },
    addons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Addon" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "productReview" }],
    ipfsHashUrl: { type: String },
    shopDetail: {},
    ipfsHash: { type: String },
    average_rating: { type: Number, default: 0 },
    fullFillmentTime:{type: Number},
    rating_count: { type: Number, default: 0 },
    shippingCharge: { type: Number },
    seoSettings: {
      title: { type: String, default: null },
      metaDescription: { type: String, default: null },
      metaKeywords: { type: String, default: null },
      facebook: {
        username: { type: String, default: null },
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null }
      },
      twitter: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        image: { type: String, default: null },
        username: { type: String, default: null },
      }
    },
    id: { type: String }, // For external api
    date_created: { type: Date },
    date_created_utc: { type: Date, default: new Date() },
    date_modified: { type: Date },
    date_modified_utc: { type: Date },
    availability: { type: Object },
    meta_data: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
    timestamps: { createdAt: 'date_created', updatedAt: 'updated_at' }
  }
)

const productTable = (module.exports = mongoose.model("Product", productSchema))

//add product
module.exports.addProduct = function (data, callback) {
  data.date_created_utc = new Date()
  productTable.create(data, callback)
}
//add product
module.exports.addProductCSV = function (data) {
  console.log("data :", data);
  data.date_created_utc = new Date()
  return productTable.findOneAndUpdate({ sku: data.sku }, { $set: data }, { upsert: true, new: true })
  // productTable.create(data, callback)

}
//add product
module.exports.addProductAsync = function (data) {
  data.date_created_utc = new Date()
  return productTable.create(data)
}
//add To Multiple Product
module.exports.addMultipleProduct = function (data, callback) {
  productTable.insertMany(data, callback);
}
//update product
module.exports.updateProduct = function (data, callback) {
  let query = { _id: data._id }
  productTable.findOneAndUpdate(query, data, { new: true }, callback)
}

module.exports.updateStatusByIds = (data, update, callback) => {
  let query = { _id: { $in: data._id } }
  productTable.updateMany(query, update, { new: true }, callback)
}

module.exports.getProductByCategoryIdAsync = (condition, categoryId, callback) => {
  return productTable
    .find(
      {
        ...condition,
        categories: { $in: [categoryId] },
        status: "active",
        stock_status: "instock",
      },
      "name price bestSeller compare_price featured_image addons short_description veganType"
    )
    .sort({ date_created_utc: -1 })
    .lean()
    .populate({ path: "featured_image", select: "link" })
    .populate({
      path: "addons",
      match: { status: "active" },
      select: "name type minLimit maxLimit required options",
    })
    .exec(callback)
}
module.exports.getProductByConditionAsync = (condition, pageOptions) => {
  return productTable.find(
    condition,
    "name price bestSeller compare_price featured_image categories vendor addons average_rating rating_count short_description veganType variations storeType"
  )
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({ date_created_utc: -1 })
    .populate({ path: "featured_image", select: "link" })
    .populate({ path: "storeType", select: "label storeType" })
    .populate({ path: "categories", select: "catName" })
    .populate({
      path: "variations"
    })
    .populate({
      path: "addons",
      match: { status: "active" },
      select: "name type minLimit maxLimit required options",
    })

}
//get product by id
module.exports.getProductById = (id, callback) => {
  productTable
    .findById(id)
    .populate({ path: "categories" })
    .populate({ path: "featured_image" })
    .populate('brand')
    .populate('department')
    .populate('obj_fbx')
    .populate('section')
    .populate({
      path: "vendor",
      populate: {
        path: 'logo'
      }
    })
    .populate({ path: "variations" })
    .populate({ path: "images" })
    .populate({ path: "addons", match: { status: "active" } })
    .lean()
    .exec(callback)
}

module.exports.getProductByIdFood = (id, callback) => {
  productTable
    .findById(id)
    .populate({ path: "categories", match: { status: "active" } })
    .populate({ path: "featured_image" })
    .populate({ path: "addons", match: { status: "active" } })
    .exec(callback)
}


module.exports.getProductByIdCarRental = (id, callback) => {
  productTable
    .findById(id)
    .populate({ path: "categories", match: { status: "active" } })
    .populate({ path: "featured_image" })
    .populate({
      path: "addons", match: { status: "active" },
      populate: {
        path: "image",
        select: "link",
      }
    })
    .exec(callback)
}

module.exports.getProductByIdAirbnb = (id, callback) => {
  productTable
    .findById(id)
    .populate({ path: "categories" })
    .populate({ path: "featured_image" })
    .populate({ path: "addons", match: { status: "active" } })
    .exec(callback)
}

module.exports.getProductByIdGrocery = (id, callback) => {
  productTable
    .findById(id)
    .populate({ path: "categories" })
    .populate({ path: "featured_image" })
    .populate({ path: "images" })
    .populate({ path: "variations" })
    .populate({ path: "brand" })
    .exec(callback)
}

module.exports.getProductByIdGroceryForFrontend = (id, callback) => {
  productTable
    .findById(
      id,
      "name bestSeller vendor status type manage_stock stock_quantity stock_status sku price compare_price short_description description categories featured_image images attributes variations brand reviews average_rating rating_count seoSettings"
    )
    .populate({
      path: "vendor",
      select: "minOrderAmont pricePerPerson orderPreparationTime",
    })
    .populate({
      path: "categories",
      select: "catName",
    })
    .populate({
      path: "featured_image",
      select: "link",
    })
    .populate({
      path: "images",
      select: "link",
    })
    .populate({
      path: "variations",
    })
    .populate({
      path: "brand",
      select: "name",
    })
    .populate({
      path: "reviews",
      perDocumentLimit: 10,
      populate: {
        path: "user",
        select: "name profileImage",
        populate: {
          path: "profileImage",
          select: "link",
        },
      },
    })
    .exec(callback)
}

module.exports.getProductByIdAsync = (id, callback) => {
  return productTable
    .findById(id)
    .populate({ path: "featured_image" })
    .exec(callback)
}
module.exports.getProductForDelivery = (id, callback) => {
  return productTable
    .findById(id)
    .populate({
      path: "categories", match: { parent: "none" }
    })
    .exec(callback)
}

module.exports.getProductByIdForFood = (id, callback) => {
  return productTable
    .findById(id)
    .populate({ path: "featured_image" })
    .populate({ path: "categories", match: { 'parent': 'none' }, })
    .exec(callback)
}

module.exports.getProductBySlug = (id, callback) => {
  productTable
    .findOne({ slug: id })
    .populate({ path: "categories" })
    .populate({
      path: "customer",
      select:
        "name username profileImage location customerAvgRating rating_count",
      populate: {
        path: "reviews",
        populate: {
          path: "user",
          select: "name profileImage",
        },
      },
    })
    .populate({ path: "featured_image" })
    .populate({ path: "images" })
    .exec(callback)
}

//remove product
module.exports.removeProduct = (id, callback) => {
  var query = { _id: id }
  productTable.remove(query, callback)
}

module.exports.removeProductImage = (data) => {
  var query = { _id: data.productId }
  var ref = data.ref
  productTable.findOneAndUpdate(
    query,
    {
      $pull: {
        images: ref,
      },
    },
    { new: true },
    function (err, res) {
      if (err) {
        console.log(err)
      }
    }
  )
}

module.exports.getProductsListF = (
  obj,
  pageSize,
  sortByField,
  sortOrder,
  paged,
  callback
) => {
  productTable.aggregate(
    [
      { $match: obj },
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featured_image",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "images",
          foreignField: "_id",
          as: "images",
        },
      },
      { $sort: { [sortByField]: parseInt(sortOrder) } },
      { $skip: (paged - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      {
        $unwind: { path: "$customerDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          price: 1,
          rrp: 1,
          size: 1,
          images: 1,
          featured_image: 1,
          customerDetails: { name: 1, username: 1, profileImage: 1 },
        },
      },
    ],
    callback
  )
}

module.exports.getProductsList = (
  obj,
  pageSize,
  sortByField,
  sortOrder,
  paged,
  callback
) => {
  productTable.aggregate(
    [
      { $match: obj },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featured_image",
        },
      },
      {
        $lookup: {
          from: "addons",
          localField: "addons",
          foreignField: "_id",
          as: "addons"
        }
      },
      {
        $lookup: {
          from: "categoryes",
          localField: "categories",
          foreignField: "_id",
          as: "categories"
        }
      },
      { $sort: { [sortByField]: parseInt(sortOrder) } },
      { $skip: (paged - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      {
        $unwind: { path: "$featured_image", preserveNullAndEmptyArrays: true },
      },
    ],
    callback
  )
}

module.exports.getProductsListForUser = (
  header,
  obj,
  imageFilter,
  pageSize,
  sortByField,
  sortOrder,
  paged,
  callback
) => {
  console.log("=== obj obj", obj);
  console.log("header ===", header)
  let aggrgrate_query = [
    { $match: obj },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $lookup: {
        from: "categoryes",
        localField: "categories",
        foreignField: "_id",
        as: "categories",
      },
    },
    {
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
      },
    },
    {
      $lookup: {
        from: "files",
        localField: "featured_image",
        foreignField: "_id",
        as: "featured_image",
      },
    },
    {
      $lookup: {
        from: "files",
        localField: "images",
        foreignField: "_id",
        as: "images",
      },
    },
    imageFilter,
    // { $sort: { date_created_utc: -1 } },
    { $sort: { [sortByField]: parseInt(sortOrder) } },
    { $skip: (paged - 1) * pageSize },
    { $limit: parseInt(pageSize) },
    //{ "$unwind": "$vendorDetails" },
    {
      $unwind: { path: "$brand", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$featured_image", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        bestSeller: 1,
        average: 1,
        vendor: 1,
        images: 1,
        compare_price: 1,
        featured_image: 1,
        date_created_utc: 1,
        api_type: 1,
        price: 1,
        compare_price: 1,
        average_rating: 1,
        status: 1,
        rating_count: 1,
        brands: { name: 1 },
        brand: { name: 1 },
        department: 1,
        section: 1,
        categories: 1,
        slug: 1
      },
    },
  ]
  if (header == "https://admin.ishopmeta.com/") {
    aggrgrate_query = [
      { $match: obj },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $lookup: {
          from: "categoryes",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "vendor",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featured_image",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "images",
          foreignField: "_id",
          as: "images",
        },
      },
      // { $sort: { date_created_utc: -1 } },
      { $sort: { [sortByField]: parseInt(sortOrder) } },
      { $skip: (paged - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      //{ "$unwind": "$vendorDetails" },
      {
        $unwind: { path: "$brand", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$featured_image", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          bestSeller: 1,
          average: 1,
          vendor: 1,
          images: 1,
          compare_price: 1,
          featured_image: 1,
          date_created_utc: 1,
          api_type: 1,
          price: 1,
          compare_price: 1,
          average_rating: 1,
          status: 1,
          rating_count: 1,
          brands: { name: 1 },
          brand: { name: 1 },
          department: 1,
          section: 1,
          categories: 1,
          slug: 1
        },
      },
    ]
  }
  productTable.aggregate(
    aggrgrate_query,
    callback
  )
}

module.exports.updateReviewDetails = (data, callback) => {
  var query = { _id: data.productId }
  var update = {
    $push: {
      reviews: data.reviewId,
    },
    average_rating: data.average_rating,
    rating_count: data.rating_count,
  }
  productTable.findOneAndUpdate(query, update, { new: true }, callback)
}
module.exports.getProductsListServiceProvider = (
  obj,
  pageSize,
  sortByField,
  sortOrder,
  paged,
  callback
) => {
  productTable.aggregate(
    [
      { $match: obj },
      {
        $lookup: {
          from: "cuisines",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {

          from: "addons",
          let: { id: "$addons" },
          pipeline: [
            {
              $match:
              {
                $expr:
                {
                  $and:
                    [
                      { $in: ["$_id", "$$id"] },
                      { $eq: ["$status", "active"] }
                    ]
                }
              }
            },
          ],
          as: "addons"
        }
      },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featur_img",
        },
      },
      { $skip: (paged - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      { $sort: { [sortByField]: parseInt(sortOrder) } },
      {
        $unwind: { path: "$featur_img", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          bestSeller: 1,
          compare_price: 1,
          featured_image: {
            $cond: {
              if: { $or: [{ $eq: [null, "$featured_image"] }, { $eq: ["", "$featured_image"] }] },
              then: null,
              else: "$featur_img"
            }
          },
          average_rating: 1,
          rating_count: 1,
          brand: { name: 1 },
          addons: 1,
          short_description: 1,
          description: 1,
          pricingType: 1,
          serviceTime: 1
        },
      },
    ],
    callback
  )
}

module.exports.getProductsDriver = (
  obj,
  sortByField,
  callback
) => {
  productTable.aggregate(
    [
      { $match: obj },
      {
        $lookup: {
          from: "cuisines",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "addons",
          localField: "addons",
          foreignField: "_id",
          as: "addons"
        }
      },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featur_img",
        },
      },
      {
        $unwind: { path: "$featur_img", preserveNullAndEmptyArrays: true }
      },
      sortByField,
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          bestSeller: 1,
          compare_price: 1,
          featured_image: {
            $cond: {
              if: { $or: [{ $eq: [null, "$featured_image"] }, { $eq: ["", "$featured_image"] }] },
              then: null,
              else: "$featur_img"
            }
          },
          average_rating: 1,
          rating_count: 1,
          brand: { name: 1 },
          addons: 1,
          short_description: 1,
          description: 1,
          pricingType: 1,
          serviceTime: 1
        },
      },
    ],
    callback
  )
}

//===
module.exports.vendorProductList = (
  vendor,
  callback
) => {
  productTable.aggregate(
    [
      { $match: { vendor: ObjectId(vendor) } },
      { $sort: { _id: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'vendor',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featur_img",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "files",
          localField: "obj_fbx",
          foreignField: "_id",
          as: "obj_fbx",
        },
      },
      { $unwind: { path: "$obj_fbx", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'productvariations',
          localField: "variations",
          foreignField: '_id',
          as: 'variations'
        }
      },
      { $group: { _id: "$user", products: { $push: "$$ROOT" } } },
      {
        $lookup: {
          from: 'files',
          localField: "_id.logo",
          foreignField: '_id',
          as: 'user_img'
        }
      },
      { $unwind: { path: "$user_img", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          "products.user": 0,
        }
      }],
    callback
  )
}

//===
module.exports.shopvendorProductList = (
  shops,
  paged,
  pageSize
) => {
  let shopList = shops.map((id) => ObjectId(id));

  return productTable.aggregate(
    [
      { $match: { shop: { $in: shopList }, status: "approved" } },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "categoryes",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: { path: "$categories", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "sections",
          localField: "section",
          foreignField: "_id",
          as: "section",
        },
      },
      { $unwind: { path: "$section", preserveNullAndEmptyArrays: false } },

      {
        $lookup: {
          from: 'users',
          localField: 'vendor',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'files',
          localField: "user.logo",
          foreignField: '_id',
          as: 'user_img'
        }
      },
      { $unwind: { path: "$user_img", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "files",
          localField: "featured_image",
          foreignField: "_id",
          as: "featur_img",
        },
      },
      { $unwind: { path: "$featur_img", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'productvariations',
          localField: "variations",
          foreignField: '_id',
          as: 'variations'
        }
      },
      {
        $group: {
          _id: "$shop",
          products: { $push: "$$ROOT" } // Push the whole document into the array
        }
      },
      { $skip: (paged - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      { $sort: { _id: -1 } }
    ]
  )
}

module.exports.productSpecification = (
  obj,
  pageSize,
  sortByField,
  sortOrder,
  paged,
  callback
) => {
  productTable.aggregate(
    [
      { $match: obj },
      // { $skip: (paged - 1) * pageSize },
      // { $limit: parseInt(pageSize) },
      // { $sort: { [sortByField]: parseInt(sortOrder) } },
      {
        $match: {
            specifications: { $exists: true } 
        }
      },
      { $unwind: { path: "$specifications", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,  
          specifications: { $addToSet: "$specifications" }
        }
      },
      {
        $project: {
          specifications: 1
        }
      }
    ],
    callback
  )
}