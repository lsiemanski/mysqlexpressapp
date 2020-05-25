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

// Apartments CRUD
/**
 * Get all apartments data.
 */
app.get('/apartments', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getAllFromTable(db.MIESZKANIE_TABLE)
    })
})
/**
 * Get a specific apartment data.
 */
app.get('/apartments/:id', async (req, res) => {
    await statement.performSelectStatement(res, false, async() => {
        return await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id)
    })
})
/**
 * Insert apartment data.
 */
app.post('/apartments', async (req, res) => {
    let apartment = req.body
    apartment.KodDostepu = await utils.generateApartmentKey()

    await statement.performInsertStatement(res, async() => {
        return await ops.insert(db.MIESZKANIE_TABLE, apartment)
    }, async(id) => {
        return await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, id)
    })
})
/**
 * Update apartment data
 */
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
/**
 * Delete specific apartment data.
 */
app.delete('/apartments/:id', async (req, res) => {
    await statement.performDeleteStatement(res, async () => {
        return await ops.deleteById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id)
    })
})

// Events CRUD
/**
 * Get all events data for a specific apartment.
 */
app.get('/events/:apt_id', async (req, res) => {
    await statement.performSelectStatement(res, false, async() => {
        return await ops.getById(db.WYDARZENIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.apt_id)
    })
})

/**
 * Insert event data for a specific apartment.
 */
app.post('/events/:apt_id', async (req, res) => {
    let event = req.body
    event.MieszkanieID = req.params.apt_id
    await statement.performInsertStatement(res, async() => {
        return await ops.insert(db.WYDARZENIE_TABLE, event)
    }, async(id) => {
        return await ops.getById(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, id)
    })
})

/**
 * Update specific event.
 */
app.put('/events/:apt_id/:event_id', async (req, res) => {
    let event = req.body

    if(event.MieszkanieID !== req.params.apt_id & event.MieszkanieID !== undefined) {
        res.end(JSON.stringify({ status: "fail", message: "Invalid request body: cannot change MieszkanieID for Wydarzenie" }))
        return
    }

    await statement.performUpdateStatement(res, async() => {
        return await ops.update(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, req.params.event_id, req.body)
    }, async() => {
        return await ops.getById(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, req.params.event_id)
    })
})

/**
 * Delete specific event data
 */
app.delete('/events/:event_id', async (req, res) => {
    await statement.performDeleteStatement(res, async () => {
        return await ops.deleteById(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, req.params.event_id)
    })
})

//Shopping CRUD
/**
 * Get all products data.
 */
app.get('/products', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getAllFromTable(db.PRODUKT_TABLE)
    })
})

/**
 * Get shopping list for a specific apartment
 */
app.get('/shopping/:apt_id', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getShoppingList(req.params.apt_id)
    })
})

/**
 * Insert new product on a shopping list -- doesn't work yet
 */
// app.post('/shopping/:apt_id', async (req, res) => {
//     let prod = req.body
//     const product =  await statement.performSelectStatement(res, true, async() => {
//         return ops.getByName(db.PRODUKT_TABLE, "Nazwa", req.body.Nazwa)
//     })
//     await statement.performSelectStatement(res, true, async() => {
//         return await product
//     })
//     if(!product) {
//         await statement.performInsertStatement(res, async() => {
//             return await ops.insert(db.PRODUKT_TABLE, prod)
//         })
//     }
// })

//Tasks CRUD
/**
 * Select all tasks data.
 */
app.get('/tasks', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getAllFromTable(db.OBOWIAZEK_TABLE)
    })
})

/**
 * Select all tasks for a specific apartment.
 */
app.get('/tasks/:apt_id', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getTasksForApartmentAndUser(db.MIESZKANIE_TABLE_ID, req.params.apt_id)
    })
})
/**
 * Select all tasks for a specific user
 */
// Returns empty array, don't know why
app.get('/tasks/:user_id', async (req, res) => {
    await statement.performSelectStatement(res, true, async() => {
        return await ops.getTasksForApartmentAndUser(db.MIESZKANIEC_TABLE_ID, req.params.user_id)
    })
})


