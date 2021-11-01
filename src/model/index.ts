import {db as db_client}  from "../db/db_client"
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
let models : any ={}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts');
  })
  .forEach(file => {
    const model = require("./" + file)(db_client.sequelize, db_client.Sequelize)
    models[model.name] = model;
  });

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const Product = models.product
const Order = models.order
const User = models.user
const Sequelize = db_client.Sequelize
const sequelize = db_client.sequelize

export { Product, Order, User, Sequelize, sequelize };

// A.hasOne(B); // A HasOne B
// A.belongsTo(B); // A BelongsTo B
// A.hasMany(B); // A HasMany B
// A.belongsToMany(B, { through: 'C' });
