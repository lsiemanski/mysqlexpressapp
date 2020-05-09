const mysql = require('mysql')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('Listening on port ', port)
})

let pool = mysql.createPool({
    user: 'root',
    password: 'password',
    database: 'MieszkankoDB',
    host: '34.67.172.88'
})

app.get('/apartments', async (req, res) => {
    let retVal;
    try {
        const apartments = await getApartments()
        if(apartments) {
            retVal = { status: 'success', data: apartments}
        }
        else {
            res.status(404)
            retVal = {status: 'fail'}
        }

    } catch(ex) {
        res.status(500)
        retVal = {status: 'error', message: ex}
    }

    res.end(JSON.stringify(retVal))
})

app.get('/apartments/:id', async (req, res) => {
    let retVal;
    try {
        const apartment = await getApartment(req.params.id)
        if(apartment) {
            retVal = {status: 'success', data: apartment}
        }
        else {
            res.status(404)
            retVal = {status: 'fail', message: 'No records found!' }
        }

    } catch(ex) {
        res.status(500)
        retVal = {status: 'error', message: ex}
    }

    res.end(JSON.stringify(retVal))
})

app.post('/apartments', async (req, res) => {
    let retVal
    try {
        const result = await createApartment(req.body)
        const apartment = await getApartment(result.insertId)
        retVal = {status: 'success', data: apartment}
    }
    catch(ex) {
        res.status(500)
        retVal = {status: 'error', message: ex}
    }

    res.end(JSON.stringify(retVal))
})

app.put('/apartments/:id', async (req, res) => {
    let retVal
    try {
        const result = await updateApartment(req.body, req.params.id)
        if(result.affectedRows == 0) {
            retVal = { status: 'fail', message: 'No records found!' }
        } else {
            const apartment = await getApartment(req.params.id)
            retVal = {status: 'success', data: apartment}
        }
    }
    catch(ex) {
        res.status(500)
        retVal = { status: 'error', message: ex }
    }

    res.end(JSON.stringify(retVal))
})

app.delete('/apartments/:id', async (req, res) => {
    let retVal
    try {
        const result = await deleteApartment(req.params.id)
        if(result.affectedRows == 0) {
            retVal = { status: 'fail', message: 'No records found!' }
        }
        else {
            retVal = { status: 'success' }
        }
    }
    catch(ex) {
        res.status(500)
        retVal = {status: 'error', message: ex}
    }

    res.end(JSON.stringify(retVal))
})

async function getApartments() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Mieszkanie'
        pool.query(sql, (err, results) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            else {
                resolve(results)
            }
        })
    })
}

async function getApartment(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Mieszkanie WHERE MieszkanieID = ?'
        pool.query(sql, id, (err, results) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            else {
                resolve(results[0])
            }
        })
    })
}

async function createApartment(apartment) {
    return new Promise((resolve, reject) => {
        apartment.KodDostepu = 'ABCDEF'
        const sql = 'INSERT INTO Mieszkanie SET ?'
        pool.query(sql, apartment, (err, results) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            else {
                resolve(results)
            }
        })
    })
}

async function updateApartment(apartment, id) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE Mieszkanie SET ? WHERE MieszkanieID = ?'
        pool.query(sql, [apartment, id], (err, results) => {
            if(err) {
                console.error(err)
                reject(err)
            }
            else {
                resolve(results)
            }
        })
    })
}

async function deleteApartment(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Mieszkanie WHERE MieszkanieID = ?'
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
}