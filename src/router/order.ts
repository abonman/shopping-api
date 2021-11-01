import * as express from "express";
import { Order } from "../model/index";
import { Product } from "../model/index";
import { sequelize } from "../model/index";
import { authentication } from "../middlewares/authentication";
import { admin_authorization } from "../middlewares/authorization";
const { QueryTypes } = require("sequelize");
const { Op } = require("sequelize");
const router = express.Router();

// get all user orders
router.get(
  "/orders",
  authentication,
  async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: { user_id: res.locals.user.id }
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

//get detaşls of order
router.get(
  "/orders/:orderId",
  authentication,
  async (req, res) => {
    try {
      const order = await Order.findOne({
        where: { id: req.params.orderId,user_id:res.locals.user.id }
      });

      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      const orderProducts: { title: string, description: string, price: string } = await sequelize.query(
        'SELECT p."title", p."description",p."price" from "orderProducts" op INNER JOIN products p on (p."id"=op."product_id") WHERE op."orderId" = (:id)',
        { replacements: { id: order.id }, type: QueryTypes.SELECT }
      )
      const detailedOrder = {
        status: order.status,
        total_product: order.total_product,
        total_price: order.total_price,
        createdAt: order.createdAt,
        products: orderProducts
      }
      return res.status(200).send(detailedOrder);
    } catch (e) {
      (e)
      res.status(500).send(e);
    }
  }
);

//create a new order
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
      user_id: res.locals.user.id,
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

    const orderProducts = await sequelize.query(
      'INSERT INTO "orderProducts" ("createdAt","updatedAt","product_id","orderId") VALUES' + orderProductList,
      { type: QueryTypes.INSERT }
    )
    if (orderProducts.length === 0) {
      throw new Error("unable to save product");
    }

    return res
      .status(201)
      .send({ message: "Newly created order successfully.", order });
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
  admin_authorization,
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
