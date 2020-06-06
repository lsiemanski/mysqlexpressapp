const ops = require('./db_operations')
const db = require('./dbnames_constants')
const jwt = require('jsonwebtoken')
const config = require('./config')
const bcrypt = require('bcryptjs')

module.exports = {
    generateApartmentKey: async function () {
        const apartmentKeys = (await ops.getAllFromTable(db.MIESZKANIE_TABLE)).map(item => item.KodDostepu)
        const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const apartmentKeyLength = 6
        let resultFound = false
        let result

        while(!resultFound) {
            result = ""
            for(let i = 0; i < apartmentKeyLength; i++) {
                result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))
            }

            if(!apartmentKeys.includes(result))
                resultFound = true
        }

        return result
    },
    verifyToken: function (req, res, next) {
        const token = req.headers['x-access-token']
        if(!token)
            return res.status(403).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, config.secretKey, {}, (err, decoded) => {
            if(err)
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token. '})

            req.userId = decoded.id
            next()
        })
    },
    generatePassword: function(password) {
        return bcrypt.hashSync(password)
    },
    comparePasswords: function(passwordToHash, hashedPassword) {
        return bcrypt.compareSync(passwordToHash, hashedPassword)
    }
}