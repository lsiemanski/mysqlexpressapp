const pool = require('./config').pool

module.exports = {
    getAllFromTable: async function (tableName) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${tableName}`;
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
    getById: async function (tableName, idColumnName, id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${tableName} WHERE ${idColumnName} = ?`
            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    insert: async function (tableName, data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ${tableName} SET ?`
            pool.query(sql, data, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    update: async function (tableName, idColumnName, id, data) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ` + tableName + ` SET ? WHERE ` + idColumnName + ` = ?`
            pool.query(sql, [data, id], (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    deleteById: async function (tableName, idColumnName, id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM ` + tableName + ` WHERE ` + idColumnName + ` = ?`

            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    getTasksForApartmentOrUser: async function (idColumnName, id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * ` +
                `FROM Obowiazek INNER JOIN Przydzial ON Obowiazek.ObowiazekID = Przydzial.ObowiazekID ` +
                `INNER JOIN MiejsceWKolejce ON Przydzial.PrzydzialID = MiejsceWKolejce.PrzydzialID ` +
                `INNER JOIN MieszkaniecWMieszkaniu ON MieszkaniecWMieszkaniu.MieszkaniecWMieszkaniuID = MiejsceWKolejce.MieszkaniecWMieszkaniuID ` +
                `WHERE ` + idColumnName + `= ?`;

            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    getShoppingList: async function (id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Wpis.ProduktID, Nazwa, Ilosc, Jednostka ` +
                `FROM Wpis INNER JOIN Produkt ` +
                `ON Wpis.ProduktID = Produkt.ProduktID `
            `WHERE MieszkanieID ` + ` = ?`

            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    getUsersForApartment: async function (id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT Mieszkaniec.Login, MieszkaniecWMieszkaniuID ` +
                `FROM Mieszkaniec ` +
                `INNER JOIN MieszkaniecWMieszkaniu ON Mieszkaniec.MieszkaniecID = MieszkaniecWMieszkaniu.MieszkaniecID ` +
                ` WHERE MieszkaniecWMieszkaniu.MieszkanieID = ?`

            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
    getAllocationForTask: async function (id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT MiejsceWkolejce.PrzydzialID, Przydzial.AktualneMiejsceWCyklu, MiejsceWKolejce.Miejsce FROM MiejsceWKolejce ` +
                `INNER JOIN Przydzial ON MiejsceWkolejce.PrzydzialID = Przydzial.PrzydzialID ` +
                `WHERE Przydzial.ObowiazekID = ?`

            pool.query(sql, id, (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(results)
                }
            })
        })
    },
}