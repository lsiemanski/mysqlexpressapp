const pool = require('./config').pool

module.exports = {
    getAllFromTable: async function(tableName) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM ' + tableName
            pool.query(sql, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    getById: async function(tableName, idColumnName, id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM ' + tableName + ' WHERE ' + idColumnName + ' = ?'
            pool.query(sql, id, (err, results) => {
                if(err) {
                    console.error(err)
                    reject(err)
                }
                else {
                    resolve(results)
                }
            })
        })
    },
    insert: async function(tableName, data) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO ' + tableName + ' SET ?'
            pool.query(sql, data, (err, results) => {
                if(err) {
                    console.error(err)
                    reject(err)
                }
                else {
                    resolve(results)
                }
            })
        })
    },
    update: async function(tableName, idColumnName, id, data) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE ' + tableName + ' SET ? WHERE ' + idColumnName + ' = ?'
            pool.query(sql, [data, id], (err, results) => {
                if(err) {
                    console.error(err)
                    reject(err)
                }
                else {
                    resolve(results)
                }
            })
        })
    },
    deleteById: async function(tableName, idColumnName, id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM ' + tableName + ' WHERE ' + idColumnName + ' = ?'
            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    }
}
