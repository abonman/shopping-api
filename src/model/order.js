module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    // id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true
    // },
    status: {
      type: Sequelize.ENUM("pending", "cancelled", "paid"),
      defaultValue: "pending",
    },
    // products: { 
    //     type : Sequelize.ARRAY(Sequelize.INTEGER), 
    //     defaultValue: null
    // },
    total_product: {
      type: Sequelize.INTEGER,
    },
    total_price: {
      type: Sequelize.INTEGER,
    },
  });

  Order.associate = (models) => {
    Order.hasMany(models.product, {
      foreignKey: "order_id",
      as: "products_fk",
    });
  };

  return Order;
};
