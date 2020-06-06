const mysql = require('mysql')
module.exports = {
    pool: mysql.createPool({
        user: 'root',
        password: 'password',
        database: 'MieszkankoDB',
        host: '35.202.197.124'
    })
}