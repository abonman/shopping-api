const jwt = require('jsonwebtoken')
import { User } from "../model/index";


export const authentication = async (req, res, next) => {
    try {
        const token: string = req.header('Authorization').replace('Bearer ', '')
        const decoded: string = jwt.verify(token, "cagri_login_secret")._id

        const user = await User.findOne({
            where: { username: decoded, token: token },
        });
        
        if (!user) {
            throw new Error("check your username or password")
        }
        // req.token = token
        // req.user = user
        res.locals.user = user
        next()
    } catch (e) {
        return res.status(401).send({ message: 'Please authenticate.' })
    }
}
