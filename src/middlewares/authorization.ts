export const admin_authorization = async (req, res, next) => {
    try {
        // white list arrayi yapıp for loopta kıyaslama yapılabilir
        if (res.locals.user.userType === "admin") {
            next()
        } else {
            return res.status(403).send({ message: "you are not authorized to do this request" })
        }
    } catch (e) {
        return res.status(403).send({ message: "Yetkin yok." })
    }
}
