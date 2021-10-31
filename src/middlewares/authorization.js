const admin_authorization = async (req, res, next) => {
    try {
        // white list arrayi yapıp for loopta kıyaslama yapılabilir
        if(req.user.userType === "admin"){
            next()
        }
    } catch (e) {
        return res.status(403).send({ message: "Yetkin yok." })
    }
}

module.exports = admin_authorization