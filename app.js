const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const db = require('./dbnames_constants')
const ops = require('./db_operations')
const statement = require('./server_statements')
const utils = require('./utils')

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('Listening on port', port)
})

app.get('/apartments', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getAllFromTable(db.MIESZKANIE_TABLE)
    })
})

app.get('/apartments/:id', async (req, res) => {
    await statement.performSelectStatement(res, false, async() => {
        return await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id)
    })
})

app.post('/apartments', async (req, res) => {
    let apartment = req.body
    apartment.KodDostepu = await utils.generateApartmentKey()

    await statement.performInsertStatement(res, async() => {
        return await ops.insert(db.MIESZKANIE_TABLE, apartment)
    }, async(id) => {
        return await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, id)
    })
})

app.put('/apartments/:id', async (req, res) => {
    if(req.body.KodDostepu !== undefined) {
        res.end(JSON.stringify({ status: "fail", message: "Invalid request body: cannot change KodDostepu" }))
        return
    }

    await statement.performUpdateStatement(res, async() => {
        return await ops.update(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id, req.body)
    }, async() => {
        return await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id)
    })
})

app.delete('/apartments/:id', async (req, res) => {
    await statement.performDeleteStatement(res, async () => {
        return await ops.deleteById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id)
    })
})

