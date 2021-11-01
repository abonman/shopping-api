import * as express from "express";
import { Product } from "../model/index";
import { authentication } from "../middlewares/authentication";
import { admin_authorization } from "../middlewares/authorization";

const router = express.Router();

router.get("/products", authentication, async (req, res) => {
  try {
    const products = await Product.findAll();
    if (!products) {
      return res.status(404).send();
    }
    res.send(products);
  } catch (e) {
    res.status(500).send();
  }
});

// post new Product
router.post(
  "/products",
  authentication,
  admin_authorization,
  async (req, res) => {
    try {
      // Validate request
      if (!req.body) {
        return res.status(400).send({
          message: "Content can not be empty!",
        });
      }
      const toBeCreatedProduct = {
        ...req.body,
      };
      // Create a Product
      const product = await Product.create(toBeCreatedProduct);
      return res
        .status(201)
        .send({ message: "Newly created Product successfully.", product });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        message:
          err.message ||
          "Some error occurred while creating the Product, check your input fields.",
      });
    }
  }
);

router.patch(
  "/products/:id",
  authentication,
  admin_authorization,
  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["title", "price", "description"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: "missing fields!" });
    }

    try {
      const product = await Product.findOne({ where: { id: req.params.id } });
      if (product) {
        updates.forEach((update) => (product[update] = req.body[update]));
        await product.save();
        res.send(product);
      } else {
        throw new Error("Product not found");
      }
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.delete(
  "/products/:id",
  authentication,
  admin_authorization,
  async (req, res) => {
    try {
      const deleted = await Product.destroy({ where: { id: req.params.id } });
      if (deleted) {
        res
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
