const jwt = require('jsonwebtoken')
const User = require("../model").user;


const authentication = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token,"cagri_login_secret")
        const user = await User.findOne({
          where: { username: decoded._id, token: token },
        });

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user

        next()
    } catch (e) {
        return res.status(401).send({ message: 'Please authenticate.' })
    }
}

module.exports = authentication