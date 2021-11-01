module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("product", {
    // id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true
    // },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
      validator: {
        len: {
          arg: [0, 300],
          mesg: "you exceed length limit max 300",
        },
      },
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  });
  Product.associate = (models) => {
    Product.belongsToMany(models.order, {
      through: "orderProducts",
      as: "products",
      foreignKey: "product_id",
    });
  };
  return Product;
};
