const db_client = require("../db/db_client");
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require("./"+file)(db_client.sequelize, db_client.Sequelize)
    db_client[model.name] = model;
  });
  Object.keys(db_client).forEach(modelName => {
    if (db_client[modelName].associate) {
        db_client[modelName].associate(db_client);
    }
  });

module.exports = db_client;

// A.hasOne(B); // A HasOne B
// A.belongsTo(B); // A BelongsTo B
// A.hasMany(B); // A HasMany B
// A.belongsToMany(B, { through: 'C' });
