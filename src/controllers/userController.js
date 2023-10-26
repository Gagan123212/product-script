const bcrypt = require("bcrypt");
const { User } = require("../models/Users");
const Joi = require("joi");
const fs = require("fs");
const csv = require("csv-parser");
const util = require("util");
const path = require("path");

const axios = require("axios");
const AttributeTerm = require("../models/attributeTermsTable");
const Attribute = require("../models/attributeTable");
const DepartmentCount = require("../models/departmentIndex");
const Department = require("../models/departmentModel");
const SectionCount = require("../models/sectionIndex");
const Section = require("../models/sectionModel");
const Category = require("../models/categoryModel");
const CategoryCount = require("../models/categoryIndex");
const Brand = require("../models/brandModel");
const ObjectId = require("objectid");
const moment = require("moment");
const productVariation = require("../models/productVariationTable");
const Product = require("../models/productsTable");
const File = require("../models/fileTable");

exports.getUsers = async (req, res) => {
  try {
    const Users = await User.find();

    res.status(200).json({
      data: Users,
      message: "Users List",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { body } = req;
    const validation = Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = validation.validate(body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const hashPassword = await bcrypt.hash(value.password, 10);
    const newObject = { ...value, password: hashPassword };
    await User.create(newObject);
    res.status(200).json({
      data: [],
      message: "Users created Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const users = await User.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    res.status(200).json({
      data: users,
      message: "user updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await User.deleteOne({ _id: id });
    res.status(200).json({ data: [], message: "User Deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

async function readCsvFile(csvFilePath) {
  const data = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      })
      .on("error", (error) => {
        reject(error);
      });
  });

  return data;
}

exports.productsScript = async (req, res) => {
  try {
    const relativePath = "../../csv-export-TD1.csv";

    // Resolve the absolute path
    const absolutePath = path.resolve(__dirname, relativePath);

    const info = await readCsvFile(absolutePath);

    const keys = [...new Set(info.map((it) => it.parent_upc))].filter(
      (item) => item !== ""
    );

    const attrInfo = [];

    // const exception =  [...new Set(info.map((e) => {
    //   if (e.OptionName0 === "Color") {
    //     return {color : e.OptionName0, value : e.OptionValue0};
    //   }
    //   return null;
    // }).filter(it => it !== null))];

   

    // return res.status(200).json({
    //   data: addUnitatt,
    // });

    const departments = [...new Set(info.map((e) => e.dept.trim()))].filter(
      (e) => e !== ""
    );

    const brands = [
      ...new Set(info.map((e) => e.manufacturer_name.trim())),
    ].filter((e) => e !== "");

    for (const brand of brands) {
      let brandQuery = {
        name: brand,
        authorId: ObjectId("6452263e58201ac82d1d14a8"),
      };
      let brandData = {
        name: brand,
        date_created_utc: new Date(),
        authorId: "6452263e58201ac82d1d14a8",
      };
      await Brand.findOneAndUpdate(brandQuery, brandData, {
        upsert: true,
        new: true,
      });
    }

    // const sections = [...new Set(info.map((e) => e.section.trim()))].filter(
    //   (e) => e !== ""
    // );
    // const categories = [...new Set(info.map((e) => e.category.trim()))].filter(
    //   (e) => e !== ""
    // );

    //Department store or update code

    // for (const department of departments) {
    //   let depCountData = await DepartmentCount.findOneAndUpdate(
    //     { name: "department" },
    //     { $inc: { number: 1 } },
    //     { upsert: true },
    //     { new: true }
    //   );
    //   let departmentQuery = { depName: department };
    //   console.log(departmentQuery);

    //   let departmentData = {
    //     depName: department,
    //     // position : Number(depCountData.number),
    //     slug: department + moment().unix(),
    //     status: "active",
    //     depDesc: " ",
    //   };
    //   await Department.findOneAndUpdate(departmentQuery, departmentData, {
    //     upsert: true,
    //     new: true,
    //   });
    // }

    const department = await Department.findOne({ depName: "Pets" }).select(
      "_id"
    );

    // option and color issue in csv
    // const colorWrongInfo = info
    //   .map((item) => {
    //     // console.log('in map', item.color, item.optionName);
    //     if (
    //       item.color !== "" &&
    //       item.OptionName0 !== "" &&
    //       item.OptionValue0 === ""
    //     ) {
    //       return {
    //         color: item.color,
    //         attr: item.OptionName0,
    //       };
    //     }
    //     return null; // Return null for items that don't meet the conditions
    //   })
    //   .filter((item) => item !== null);

    // console.log(colorWrongInfo);

    // return res.status(200).json({
    //   data: colorWrongInfo,
    // });

    // const sectionAndCategoriesSet = new Set();

    // info.forEach((e) => {
    //   const section = e.section.trim();
    //   const category = e.category.trim();

    //   if (section !== "" && category !== "") {
    //     sectionAndCategoriesSet.add(JSON.stringify({ section, category }));
    //   }
    // });

    // const uniqueSectionAndCategories = [...sectionAndCategoriesSet].map(
    //   JSON.parse
    // );

    // console.log(uniqueSectionAndCategories);

    // for (const item of uniqueSectionAndCategories) {
    //   // console.log(section);
    //   const isExistSection = await Section.findOne({
    //     sectionName: item.section,
    //   });

    //   let sectcountData = {};
    //   let sectionQuery = { sectionName: item.section };
    //   // console.log(isExistSection);

    //   if (!isExistSection) {
    //     sectcountData = await SectionCount.findOneAndUpdate(
    //       { name: "section" },
    //       { $inc: { number: 1 } },
    //       { upsert: true },
    //       { new: true }
    //     );
    //   } else {
    //     sectcountData.number = isExistSection.position;
    //   }
    //   // console.log(sectcountData);

    //   let sectionData = {
    //     sectionName: item.section,
    //     department: department._id,
    //     position: Number(sectcountData.number),
    //     date_created_utc: new Date(),
    //     slug: item.section + moment().unix(),
    //     status: "active",
    //     sectionDesc: " ",
    //   };
    //   const sectionInfo = await Section.findOneAndUpdate(
    //     sectionQuery,
    //     sectionData,
    //     {
    //       upsert: true,
    //       new: true,
    //     }
    //   );

    //   let catQuery = { catName: item.categories };
    //   const isCatExist = await Category.findOne({ catName: item.category });
    //   console.log(isCatExist);
    //   let catCountData = {};
    //   if (!isCatExist) {
    //     console.log("in if");
    //     catCountData = await CategoryCount.findOneAndUpdate(
    //       { name: "category" },
    //       { $inc: { number: 1 } },
    //       { upsert: true },
    //       { new: true }
    //     );
    //   } else {
    //     console.log("in else");
    //     catCountData.number = isCatExist.position;
    //   }
    //   console.log(catCountData);
    //   let categoryData = {
    //     catName: item.category,
    //     slug: item.category + moment().unix(),
    //     catImage: null,
    //     department: department._id,
    //     date_created_utc: new Date(),
    //     section: sectionInfo._id,
    //     position: Number(catCountData.number),
    //     isFeatured: true,
    //     status: "active",
    //     parent: "none",
    //     catDesc: item.sections,
    //   };

    //   let category = await Category.findOneAndUpdate(catQuery, categoryData, {
    //     upsert: true,
    //     new: true,
    //   });
    // }

    for (const iterator of keys) {
      const keysRelatedProducts = info.filter((e) => e.parent_upc === iterator);
      // console.log(keysRelatedProducts[0]);
      const firstProduct = keysRelatedProducts[0];

      const variations = [];
      const attributes = [];
      const brand = await Brand.findOne({
        name: firstProduct.manufacturer_name.trim(),
      }).select("_id");
      const section = await Section.findOne({
        sectionName: firstProduct.section.trim(),
      }).select("_id");
      const category = await Category.findOne({
        catName: firstProduct.category.trim(),
      }).select("_id");

      const optionsPro = {};

      let attributeName = "";
      let attributeInfo = "";
      let attribuiteTearmName = "";
      let attribuiteTearm = "";
      for (const product of keysRelatedProducts) {
        const attribuiteTearmInfo = [];
        for (let i = 0; i < 10; i++) {
          // Assuming the maximum index is 9
          const optionName = product[`OptionName${i}`];
          const optionValue = product[`OptionValue${i}`];

          if (
            optionName !== undefined &&
            optionName !== "" &&
            optionValue !== undefined &&
            optionValue !== ""
          ) {
            if (
              attributeName !== optionName ||
              attributeName === "" ||
              attributeInfo === "" ||
              attributeInfo?.name !== optionName
            ) {
              console.log(optionName, "option NAme ");
              let info = await Attribute.findOne({
                name:
                  optionName.trim() === "STYLE" || "style"
                    ? "Style"
                    : optionName.trim(),
              });
              if (!info && product.size === "" && product.color !== "") {
                const data = {
                  vendor: "6452263e58201ac82d1d14a8",
                  name: optionName,
                  status: "active",
                  slug: optionName.trim(),
                  terms: [], // Initialize the terms property
                };
                const getTerm = await AttributeTerm.findOneAndUpdate(
                  { vendor: data.vendor, name: product.color },
                  { name: term, status: "active" },
                  { upsert: true, new: true }
                );

                if (getTerm != null) {
                  if (!data.terms.includes(getTerm._id.toString())) {
                    data.terms.push(getTerm._id.toString());
                  }
                }
                const query = { slug: data.slug, vendor: data.vendor };
                const update = {
                  $set: {
                    vendor: data.vendor,
                    name: data.name,
                    status: data.status,
                    slug: data.slug,
                  },
                  $addToSet: { terms: { $each: data.terms } }, // Add new terms to the existing array
                };

                info = await Attribute.findOneAndUpdate(query, update, {
                  upsert: true,
                  new: true,
                });
              }
              attributeInfo = info;
              attributeName = optionName;
            }
            if (
              attribuiteTearmName !== optionValue ||
              attribuiteTearmName === "" ||
              attribuiteTearm === "" ||
              attribuiteTearm === null
            ) {
              attribuiteTearm = await AttributeTerm.findOne({
                name: optionValue.trim(),
              });
              attribuiteTearmName = optionValue;
            }
            console.log(attribuiteTearm, product);
            attribuiteTearmInfo.push({
              _id: attribuiteTearm._id,
              name: attribuiteTearm.name,
            });

            if (!attributes.length) {
              let info = {
                _id: attributeInfo._id,
                name: attributeInfo.name,
                terms: [...attribuiteTearmInfo],
              };
              attributes.push(info);
            } else {
              // Find the existing attribute info
              const existingAttributeInfo = attributes.find(
                (attr) => attr.name === attributeInfo.name
              );

              if (existingAttributeInfo) {
                // Add new terms to the existing terms array
                // existingAttributeInfo.terms =
                const existingNames = existingAttributeInfo.terms.map(
                  (term) => term.name
                );

                for (const term of attribuiteTearmInfo) {
                  if (!existingNames.includes(term.name)) {
                    existingAttributeInfo.terms.push(term);
                    existingNames.push(term.name);
                  }
                }
                // existingAttributeInfo.terms.push(...attribuiteTearmInfo); // Concatenate the new terms
              } else {
                // If the attribute doesn't exist, create a new one
                let newAttributeInfo = {
                  _id: attributeInfo._id,
                  name: attributeInfo.name,
                  terms: [...attribuiteTearmInfo], // Replace with the new terms array
                };
                attributes.push(newAttributeInfo);
              }
            }

            // console.log({optionName, optionValue});
          }
        }

        const sizeTerms = [];
        const colorTerms = [];
        const unitsTerms = [];
        if (product.size.trim() !== "" && product.size.trim()) {
          // console.log("here is", product);
          console.log(product.size, {
            name: product.size.trim(),
          });
          attribuiteTearm = await AttributeTerm.findOne({
            name: product.size.trim(),
          });
          // attribuiteTearmName = optionValue;
          sizeTerms.push({
            _id: attribuiteTearm._id,
            name: attribuiteTearm.name,
          });

          attributeInfo = await Attribute.findOne({ name: "Size" });
          // Find the existing attribute info
          const existingAttributeInfo = attributes.find(
            (attr) => attr.name === attributeInfo.name
          );

          if (existingAttributeInfo) {
            // Add new terms to the existing terms array
            const existingNames = existingAttributeInfo.terms.map(
              (term) => term.name
            );

            for (const term of sizeTerms) {
              if (!existingNames.includes(term.name)) {
                existingAttributeInfo.terms.push(term);
                existingNames.push(term.name);
              }
            }
            // existingAttributeInfo.terms.push(...sizeTerms); // Concatenate the new terms
          } else {
            // If the attribute doesn't exist, create a new one
            let newAttributeInfo = {
              _id: attributeInfo._id,
              name: attributeInfo.name,
              terms: [...sizeTerms], // Replace with the new terms array
            };
            attributes.push(newAttributeInfo);
          }
        }

        if (product.pack_of.trim() !== "" && product.pack_of.trim()) {
          attribuiteTearm = await AttributeTerm.findOne({
            name: product.pack_of.trim(),
          });
          // attribuiteTearmName = optionValue;
          unitsTerms.push({
            _id: attribuiteTearm._id,
            name: attribuiteTearm.name,
          });

          attributeInfo = await Attribute.findOne({ name: "Units" });
          // Find the existing attribute info
          const existingAttributeInfo = attributes.find(
            (attr) => attr.name === attributeInfo.name
          );

          if (existingAttributeInfo) {
            // Add new terms to the existing terms array
            const existingNames = existingAttributeInfo.terms.map(
              (term) => term.name
            );

            for (const term of unitsTerms) {
              if (!existingNames.includes(term.name)) {
                existingAttributeInfo.terms.push(term);
                existingNames.push(term.name);
              }
            }
          } else {
            // If the attribute doesn't exist, create a new one
            let newAttributeInfo = {
              _id: attributeInfo._id,
              name: attributeInfo.name,
              terms: [...unitsTerms], // Replace with the new terms array
            };
            attributes.push(newAttributeInfo);
          }
        }

        if (
          product.color !== "" &&
          ((product.OptionName0 === "" && product.OptionValue0 === "") ||
            (product.OptionName0 !== "" && product.OptionValue0 !== ""))
        ) {
          attribuiteTearm = await AttributeTerm.findOne({
            name: product.color.trim(),
          });
          // attribuiteTearmName = optionValue;
          colorTerms.push({
            _id: attribuiteTearm._id,
            name: attribuiteTearm.name,
          });

          attributeInfo = await Attribute.findOne({ name: "Color" });
          // Find the existing attribute info
          const existingAttributeInfo = attributes.find(
            (attr) => attr.name === attributeInfo.name
          );

          if (existingAttributeInfo) {
            // Add new terms to the existing terms array
            const existingNames = existingAttributeInfo.terms.map(
              (term) => term.name
            );

            for (const term of colorTerms) {
              if (!existingNames.includes(term.name)) {
                existingAttributeInfo.terms.push(term);
                existingNames.push(term.name);
              }
            }
            // existingAttributeInfo.terms.push(...colorTerms); // Concatenate the new terms
          } else {
            // If the attribute doesn't exist, create a new one
            let newAttributeInfo = {
              _id: attributeInfo._id,
              name: attributeInfo.name,
              terms: [...colorTerms], // Replace with the new terms array
            };
            attributes.push(newAttributeInfo);
          }
        }
        const mergedArray = [
          ...attribuiteTearmInfo,
          ...sizeTerms,
          ...colorTerms,
          ...unitsTerms
        ];
        let productVariationData = {
          price: product.cost,
          compare_price: product.MSRP,
          sku: product.parent_name + moment().unix(),
          stock_quantity: product.QTY_available,
          attributes: mergedArray,
          image: product.picture_url_1,
          images: [product.picture_url_1],
          description: firstProduct.product_description,
          tdid: product.tdid,
        };
        const query = { tdid: product.tdid };
        const variation = await productVariation.findOneAndUpdate(
          query,
          productVariationData,
          {
            upsert: true,
            new: true,
          }
        );
        if (!variations[variation._id]) {
          variations.push(variation._id);
        }
      }

      console.log("overall attribute", attributes);

      // console.log(optionsPro);

      // for (let index = 1; index <= 10; index++) {
      //   const element = firstProduct[`picture_url_${index}`];
      //   console.log(element);
      //   let updatedString = element;
      //   if (index >= 2 && index <= 4) {
      //     // Update the string when index is 2, 3, or 4
      //     updatedString = updatedString.replace(/\d+(?=\.)\./, `${index-1}.`);
      //   }
      //   listImages.push(updatedString);
      // }

      let images = [];
      if (firstProduct.picture_url_1) {
        // await Promise.all(
        // listImages.map(async (f) => {
        let file = {
          link: firstProduct.picture_url_1,
          mimeType: "image",
          type: "image",
        };
        const fileQuery = { link: firstProduct.picture_url_1 };
        let fileData = await File.findOneAndUpdate(fileQuery, file, {
          upsert: true,
          new: true,
        });
        images.push(fileData._id);
        // })
        // );
      }

      let productData = {
        vendor: "6452263e58201ac82d1d14a8",
        // id: firstProduct.id,
        name: firstProduct.parent_name,
        displayName: firstProduct.parent_name,
        date_created_utc: new Date(),
        slug: firstProduct.parent_name + moment().unix(),
        type: "simple",
        status: "approved",
        average: firstProduct.shipAvg || 0,
        isFeatured: false,
        brand: brand._id,
        short_description: firstProduct.channel_restriction,
        description: firstProduct.product_description,
        sku: firstProduct.product_code,
        upcId: firstProduct.parent_upc,
        price: firstProduct.cost,
        api_type: "external_api",
        compare_price: firstProduct.MSRP,
        department: department._id,
        section: section._id,
        categories: category._id,
        stock_quantity: firstProduct.QTY_available,
        pricingType: "unit",
        stock_status: "instock",
        total_sales: 0,
        featured_image: images[0],
        images: images ?? null,
        acceptReturn: false,
        returnDays: firstProduct.return,
        tdid: firstProduct.tdid,
        attributes: attributes,
        variations: variations,
      };
      let query = { tdid: firstProduct.tdid };
      await Product.findOneAndUpdate(query, productData, {
        upsert: true,
        new: true,
      });
      // console.log("product Info ", productData);

      // if (iterator === "124-736473105460-1") break;

      // const options = {};

      // strong attributes and attributes terms
      // for (const item of keysRelatedProducts) {
      //   const terms = [
      //     ...new Set(keysRelatedProducts.map((it) => it.size.trim())),
      //   ].filter((term) => term !== "");

      //   const colorTerms = [
      //     ...new Set(keysRelatedProducts.map((it) => it.color.trim())),
      //   ].filter((item) => item !== "");

      //   const addUnitatt = [...new Set(keysRelatedProducts.map((it) => it.pack_of.trim()))].filter(
      //     (e) => e !== ""
      //   );


      //   options['Units']  = addUnitatt;
      //   options["Size"] = terms;
      //   options["Color"] = colorTerms;
      //   for (let i = 0; i < 10; i++) {
      //     // Assuming the maximum index is 9
      //     const optionName = item[`OptionName${i}`];
      //     const optionValue = item[`OptionValue${i}`];

      //     if (
      //       optionName !== undefined &&
      //       optionName !== "" &&
      //       optionValue !== undefined &&
      //       optionValue !== ""
      //     ) {
      //       if (!options[optionName]) {
      //         options[optionName] = [];
      //       }
      //       options[optionName].push(optionValue.trim());
      //     }
      //   }
      // }
      // for (const key in options) {
      //   if (Object.hasOwn(options, key)) {
      //     console.log(options);
      //     const values = options[key];
      //     console.log(values);
      //     const data = {
      //       vendor: "6452263e58201ac82d1d14a8",
      //       name: key,
      //       status: "active",
      //       slug: key.trim(),
      //       terms: [], // Initialize the terms property
      //     };
      //     console.log("data ", data);

      //     if (values && values.length > 0) {
      //       for (const term of values) {
      //         const getTerm = await AttributeTerm.findOneAndUpdate(
      //           { vendor: data.vendor, name: term },
      //           { name: term, status: "active" },
      //           { upsert: true, new: true }
      //         );

      //         if (getTerm != null) {
      //           if (!data.terms.includes(getTerm._id.toString())) {
      //             data.terms.push(getTerm._id.toString());
      //           }
      //         }
      //       }
      //     }
      //     const query = { slug: data.slug, vendor: data.vendor };
      //     const update = {
      //       $set: {
      //         vendor: data.vendor,
      //         name: data.name,
      //         status: data.status,
      //         slug: data.slug,
      //       },
      //       $addToSet: { terms: { $each: data.terms } }, // Add new terms to the existing array
      //     };

      //     await Attribute.findOneAndUpdate(query, update, {
      //       upsert: true,
      //       new: true,
      //     });
      //     attrInfo.push(options);
      //   }
      // }
    }

    res.status(200).json({
      mes: "this it script",
      data: { brands, departments },
    });
  } catch (error) {
    console.log(error);
  }
};

// old code

// const terms = [...new Set(info.map((it) => it.size.trim()))].filter(
//   (term) => term !== ""
// );

// const data = {
//   vendor: "6452263e58201ac82d1d14a8",
//   name: "Size",
//   status: "active",
//   slug: "Size",
//   terms: [], // Initialize the terms property
// };

// if (terms && terms.length > 0) {
//   for (const term of terms) {
//     const getTerm = await AttributeTerm.findOneAndUpdate(
//       { vendor: data.vendor, name: term },
//       { name: term, status: "active" },
//       { upsert: true, new: true }
//     );

//     if (getTerm != null) {
//       if (!data.terms.includes(getTerm._id.toString())) {
//         data.terms.push(getTerm._id.toString());
//       }
//     }
//   }
// }

//   for (const iterator of keys) {
//     console.log(iterator);
//     const dataForSpecificParent = info.filter(e => e.parent_upc === iterator);

//   res.status(200).json({
//     mes: 'this it script',
//     data : terms

//   })
//   if(iterator === '3-850011460009-1') break
// }
// console.log(info);
