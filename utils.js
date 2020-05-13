const ops = require('./db_operations')
const db = require('./dbnames_constants')

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
    }
}