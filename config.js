const mysql = require('mysql')
module.exports = {
    pool: mysql.createPool({
        user: 'root',
        password: 'password',
        database: 'MieszkankoDB',
        host: '35.202.197.124' // used locally
        //socketPath: '/cloudsql/mieszkanko:us-central1:mieszkanko' // used on cloud server
    }),
    secretKey: '344C8E6EED7B043C03908F8271EE93AAA3AF64350624C650CBB38993557607AA'
}