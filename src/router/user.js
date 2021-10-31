const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model").user;
const router = express.Router();
const authentication = require("../middlewares/authentication");
const admin_authorization = require("../middlewares/authorization");


router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ where:{ username: req.body.username }});
    let isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.status(400).send({ message: "Yanlış şüfre" });
    }
    const token = jwt.sign({ _id: user.username }, "cagri_login_secret");
    user.token = token;
    await user.save()
    return res.status(200).send({ message: "aferim oldu", user });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message:
        err.message ||
        "Some error occurred while login process, check your input fields.",
    });
  }
});

// post new user
router.post("/users",authentication,admin_authorization, async (req, res) => {
    try {
      // Validate request
      if (!req.body) {
        return res.status(400).send({
          message: "Content can not be empty!",
        });
      }
      const toBeCreatedUser = {
        ...req.body,
      };
      toBeCreatedUser.password = await bcrypt.hash(toBeCreatedUser.password, 8);

      // Create a User
      const user = await User.create(toBeCreatedUser);
      return res
        .status(201)
        .send({ message: "Newly created user successfully.", user });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        message:
          err.message ||
          "Some error occurred while creating the User, check your input fields.",
      });
    }
  }
);

router.post("/users/admin", async (req, res) => {
  try {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content can not be empty!",
      });
    }
    const toBeCreatedUser = {
      ...req.body,
    };
    toBeCreatedUser.password = await bcrypt.hash(toBeCreatedUser.password, 8);

    // Create a User
    const user = await User.create(toBeCreatedUser);
    return res
      .status(201)
      .send({ message: "Newly created user successfully.", user });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message:
        err.message ||
        "Some error occurred while creating the User, check your input fields.",
    });
  }
}
);

router.patch("/users", authentication, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "password", "email"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  
  if (!isValidOperation) {
    return res.status(400).send({ error: "missing fields!" });
  }

  try {
    const user = await User.findOne({where: {id: req.user.id}});
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 8);
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      res.send(user);
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
});

router.delete("/users/:id", authentication, admin_authorization, async (req, res) => {
    try {
      const deleted = await User.destroy({where: { id: req.params.id }})
      if (deleted) {
        res.status(200).send('user with id:'+ req.params.id +' Removed Successfully')
      } else {
        throw new Error("User not found");
      }
    } catch (e) {
      res.status(500).send('user not found!');
    }
  }
);

module.exports = router;
