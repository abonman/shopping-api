const express = require("express");
const Order = require("../model").order;
const Product = require("../model").product;
const model = require("../model");
const { QueryTypes } = require("sequelize");
const Op = require("sequelize").Op;
const router = express.Router();
const authentication = require("../middlewares/authentication");
const admin_authorization = require("../middlewares/authorization");

router.get(
  "/orders",
  authentication,
  async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: { user_id: req.user.id }
      });
     
     
      if (!orders) {
        return res.status(404).send();
      }
  
      return res.send(orders);
    } catch (e) {
        console.log(e)
      res.status(500).send(e);
    }
  }
);
router.get(
    "/orders/:orderId",
    authentication,
    async (req, res) => {
      try {
        const order = await Order.findOne({
          where: { user_id: req.user.id }
        });
       
       
        if (!order) {
          return res.status(404).send();
        }

        const orderProducts = await model.sequelize.query(
          'SELECT p."title", p."description",p."price" from "orderProducts" op INNER JOIN products p on (p."id"=op."product_id") WHERE op."orderId" ='+ order.id+'',
          { type: QueryTypes.SELECT }
        )
        order.products=orderProducts
        return res.status(200).send(order);
      } catch (e) {
          (e)
        res.status(500).send(e);
      }
    }
  );
// post new Product
router.post("/orders", authentication, async (req, res) => {
  try {
    // Validate request
    let productIds = req.body.orderProducts.map((id) => parseInt(id));
    if (!req.body || productIds.length === 0) {
      return res.status(400).send({
        message: "Content can not be empty!",
      });
    }

    const orderObject = {
      status: req.body.status,
      total_product: 0,
      total_price: 0,
      products: [],
      user_id: req.user.id,
    };

    // Check Product
    const productList = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
      },
    });

    if (productList.length === 0) {
      return res.status(400).send({
        data: [
          { message: "Unknown products", context: { key: "product_list" } },
        ],
      });
    }

    productIds = [];

    productList.forEach(async (product) => {
      orderObject.total_price += await product.price;
      productIds.push(product.id);
    });
    orderObject.total_product = productList.length;
    orderObject.products = productIds;

    const order = await Order.create(orderObject);

    let orderProductList = "";

    productList.forEach(async (prod) => {
      orderProductList +=
        "(NOW(),NOW()," +
        prod.id +
        "," +
        order.id +
        "),";
    });
    orderProductList = orderProductList.slice(0, -1)

    const orderProducts = await model.sequelize.query(
      'INSERT INTO "orderProducts" ("createdAt","updatedAt","product_id","orderId") VALUES' + orderProductList,
      { type: QueryTypes.INSERT }
    )
       
    return res
      .status(201)
      .send({ message: "Newly created order successfully.", order});
  } catch (err) {
    (err);
    return res.status(400).send({
      message:
        err.message ||
        "Some error occurred while creating the Product, check your input fields.",
    });
  }
});


router.delete(
  "/orders/:id",
  authentication,
  async (req, res) => {
    try {
      const deleted = await Order.destroy({ where: { id: req.params.id } });
      if (deleted) {
        return res
          .status(200)
          .send("product with id:" + req.params.id + " Removed Successfully");
      } else {
        throw new Error("Product not found");
      }
    } catch (e) {
      res.status(500).send("Product not found!");
    }
  }
);

module.exports = router;
