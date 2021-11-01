module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    // id: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true
    // },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING, // mail bak
    },
    password: {
      type: Sequelize.STRING,
    },
    token: {
      type: Sequelize.STRING,
    },
    userType: {
      type: Sequelize.ENUM("customer", "admin"),
    },
  });
  User.associate = (models) => {
    User.hasMany(models.order, {
      foreignKey: "user_id",
      as: "orders",
    });
  };
  return User;
};
