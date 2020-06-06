const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const db = require('./dbnames_constants')
const ops = require('./db_operations')
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
    try {
        const apartments = await ops.getAllFromTable(db.MIESZKANIE_TABLE);

        if (apartments) {
            res.send({
                data: apartments
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
});
/**
 * Get a specific apartment data.
 */
app.get('/apartments/:id', async (req, res) => {
    try {
        const apartment = await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id);

        if (apartment) {
            res.send({
                data: apartment
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})
/**
 * Insert apartment data.
 */
app.post('/apartments', async (req, res) => {
    const {
        Nazwa
    } = req.body;
    const apartment = {
        Nazwa,
        KodDostepu: await utils.generateApartmentKey()
    };

    try {
        await ops.insert(db.MIESZKANIE_TABLE, apartment);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})
/**
 * Update apartment data
 */
app.put('/apartments/:id', async (req, res) => {
    if (req.body.KodDostepu) {
        res.status(400).send("Invalid request body: cannot change KodDostepu");
    }

    try {
        const result = await ops.update(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id, req.body);
        if (!result.affectedRows) {
            res.sendStatus(404);
        }

        res.send(200);
    } catch (err) {
        res.status(500).send(err);
    }
})
/**
 * Delete specific apartment data.
 */
app.delete('/apartments/:id', async (req, res) => {
    try {
        const result = await ops.deleteById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.id);
        if (!result.affectedRows) {
            res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
})

// Events CRUD
/**
 * Get all events data for a specific apartment.
 */
app.get('/events/:apt_id', async (req, res) => {
    try {
        const events = await ops.getById(db.WYDARZENIE_TABLE, db.MIESZKANIE_TABLE_ID, req.params.apt_id)

        if (events) {
            res.send({
                data: events
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Insert event data for a specific apartment.
 */
app.post('/events/:apt_id', async (req, res) => {
    const event = {
        ...req.body,
        MieszkanieID: req.params.apt_id
    };

    try {
        await ops.insert(db.WYDARZENIE_TABLE, event)

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Update specific event.
 */
app.put('/events/:apt_id/:event_id', async (req, res) => {
    const {
        MieszkanieID
    } = req.body

    try {
        if (MieszkanieID) {
            res.sendStatus(400);
        }

        await ops.update(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, req.params.event_id, req.body)

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Delete specific event data
 */
app.delete('/events/:event_id', async (req, res) => {
    try {
        const result = await ops.deleteById(db.WYDARZENIE_TABLE, db.WYDARZENIE_TABLE_ID, req.params.event_id)
        if (!result.affectedRows) {
            res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }

})

//Shopping CRUD
/**
 * Get all products data.
 */
app.get('/products', async (req, res) => {
    try {
        const products = await ops.getAllFromTable(db.PRODUKT_TABLE)

        if (products) {
            res.send({
                data: products
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Get shopping list for a specific apartment
 */
app.get('/shopping/:apt_id', async (req, res) => {
    try {
        const shoppingList = await ops.getShoppingList(req.params.apt_id)

        if (shoppingList) {
            res.send({
                data: shoppingList
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Insert new product on a shopping list
 */
app.post('/shopping/:apt_id', async (req, res) => {
    const {
        MieszkaniecID,
        Ilosc,
        Jednostka,
        Nazwa
    } = req.body

    try {
        const {
            insertId
        } = await ops.insert(db.PRODUKT_TABLE, {
            Nazwa
        })
        await ops.insert(db.WPIS_TABLE, {
            MieszkanieID: req.params.apt_id,
            MieszkaniecID,
            Ilosc,
            Jednostka,
            ProduktID: insertId
        })
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Update shopping list item
 */
app.put('/shopping/:apt_id/:item_id', async (req, res) => {
    const {
        MieszkaniecID,
        Ilosc,
        Jednostka,
        Nazwa
    } = req.body

    try {
        const item = await ops.getById(db.WPIS_TABLE, db.WPIS_TABLE_ID, req.params.item_id)

        if (Nazwa) {
            await ops.update(db.PRODUKT_TABLE, db.PRODUKT_TABLE_ID, item[0].ProduktID, {
                Nazwa
            })
        }

        await ops.update(db.WPIS_TABLE, db.WPIS_TABLE_ID, req.params.item_id, {
            MieszkanieID: req.params.apt_id,
            MieszkaniecID,
            Ilosc,
            Jednostka,
        })

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Delete from shopping list
 */
app.delete('/shopping/:item_id', async (req, res) => {
    try {
        const item = await ops.getById(db.WPIS_TABLE, db.WPIS_TABLE_ID, req.params.item_id)

        const result = await ops.deleteById(db.WPIS_TABLE, db.WPIS_TABLE_ID, req.params.item_id)
        if (!result.affectedRows) {
            res.sendStatus(404);
        }
        await ops.deleteById(db.PRODUKT_TABLE, db.PRODUKT_TABLE_ID, item[0].ProduktID)

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }

})

//Tasks CRUD
/**
 * Select all tasks data.
 */
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await ops.getAllFromTable(db.OBOWIAZEK_TABLE)

        if (tasks) {
            res.send({
                data: tasks
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Select all tasks for a specific apartment.
 */
app.get('/tasks/:apt_id', async (req, res) => {
    try {
        const tasks = await ops.getTasksForApartmentOrUser(db.MIESZKANIE_TABLE_ID, req.params.apt_id)

        if (tasks) {
            res.send({
                data: tasks
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})
/**
 * Select all tasks for a specific user
 */
// Notice, that the url is task not tasks!
app.get('/task/:user_id', async (req, res) => {
    try {
        const tasks = await ops.getTasksForApartmentOrUser(db.MIESZKANIEC_W_MIESZKANIU_TABLE + '.' + db.MIESZKANIEC_W_MIESZKANIU_TABLE_ID, req.params.user_id)

        if (tasks) {
            res.send({
                data: tasks
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})
/**
 * Insert new task
 */
app.post('/tasks', async (req, res) => {
    const {
        Opis,
        Powtarzalnosc,
        MieszkaniecWMieszkaniuID,
        Rozpoczecie
    } = req.body

    try {
        const resultObowiazek = await ops.insert(db.OBOWIAZEK_TABLE, {
            Opis
        })
        const resultPrzydzial = await ops.insert(db.PRZYDZIAL_TABLE, {
            ObowiazekID: resultObowiazek.insertId,
            Rozpoczecie,
            AktualneMiejsceWCyklu: 1,
            Powtarzalnosc
        })
        for (let i = 1; i <= MieszkaniecWMieszkaniuID.length; i++) {
            await ops.insert(db.MIEJSCE_W_KOLEJCE_TABLE, {
                Miejsce: i,
                MieszkaniecWMieszkaniuID: MieszkaniecWMieszkaniuID[i - 1],
                PrzydzialID: resultPrzydzial.insertId
            })
        }
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})
/**
 * Update task data -- for task data update view, not for the frequency update 
 * I assume that task_id is Obowiazek_ID
 * DOESN'T WORK YET!
 */
// TODO

/**
 * Update AktualneMiejsceWCyklu.
 * task_id means ObowiazekID.
 */
app.put('/tasks/:task_id', async (req, res) => {
    const {
        AktualneMiejsceWCyklu
    } = req.body

    try {
        const tasks = await ops.getAllocationForTask(req.params.task_id)

        await ops.update(db.PRZYDZIAL_TABLE, db.PRZYDZIAL_TABLE_ID, tasks[0].PrzydzialID, {
            // this assures that the cycle is closed
            AktualneMiejsceWCyklu: (AktualneMiejsceWCyklu % tasks.length === 0) ? tasks.length : (AktualneMiejsceWCyklu % tasks.length)
        })

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})

/**
 * Delete task.
 * task_id means ObowiazekID
 * Works, but needs improvement, because it doesn't return the right code, but an empty array.
 */
app.delete('/tasks/:task_id', async (req, res) => {
    try {
        const taskAllocation = await ops.getById(db.PRZYDZIAL_TABLE, db.OBOWIAZEK_TABLE_ID, req.params.task_id)

        const deletePlaceInLine = await ops.deleteById(db.MIEJSCE_W_KOLEJCE_TABLE, db.PRZYDZIAL_TABLE_ID, taskAllocation[0].PrzydzialID)

        if (!deletePlaceInLine.affectedRows) {
            res.sendStatus(404);
        }
        const deleteTaskAllocation = await ops.deleteById(db.PRZYDZIAL_TABLE, db.OBOWIAZEK_TABLE_ID, req.params.task_id)

        if (!deleteTaskAllocation.affectedRows) {
            res.sendStatus(404);
        }

        await ops.deleteById(db.OBOWIAZEK_TABLE, db.OBOWIAZEK_TABLE_ID, taskAllocation[0].ObowiazekID)

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }

})

//Users CRUD
/**
 * Select users login and id in flat for a specific apartment
 */
app.get('/users/:apt_id', async (req, res) => {
    try {
        const users = await ops.getUsersForApartment(req.params.apt_id)

        if (users) {
            res.send({
                data: users
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        res.status(500).send(err)
    }
})