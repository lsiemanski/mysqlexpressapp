const mysql = require('mysql')
module.exports = {
    pool: mysql.createPool({
        user: 'root',
        password: 'password',
        database: 'MieszkankoDB',
        host: '34.67.172.88'
    })
}