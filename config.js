const mysql = require('mysql')
module.exports = {
    pool: mysql.createPool({
        user: 'root',
        password: 'password',
        database: 'MieszkankoDB',
        host: '35.202.197.124'
    }),
    secretKey: '344C8E6EED7B043C03908F8271EE93AAA3AF64350624C650CBB38993557607AA'
}