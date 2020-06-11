const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const db = require('./dbnames_constants')
const ops = require('./db_operations')
const utils = require('./utils')
const jwt = require('jsonwebtoken')
const config = require('./config')

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('Listening on port', port)
})

// Apartments CRUD
/**
 * Get all apartments data.
 */
app.get('/apartments', utils.verifyToken, async (req, res) => {
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
app.get('/apartments/:id', utils.verifyToken, async (req, res) => {
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
app.post('/apartments', utils.verifyToken, async (req, res) => {
    const {
        Nazwa
    } = req.body;

    const apartment = {
        Nazwa,
        KodDostepu: await utils.generateApartmentKey()
    };

    try {
        const {
            insertId
        } = await ops.insert(db.MIESZKANIE_TABLE, apartment);

        const resultApartment = await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_ID, insertId)

        res.status(200).send({
            data: resultApartment
        });

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})
/**
 * Update apartment data
 */
app.put('/apartments/:id', utils.verifyToken, async (req, res) => {
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
app.delete('/apartments/:id', utils.verifyToken, async (req, res) => {
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
app.get('/events/:apt_id', utils.verifyToken, async (req, res) => {
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
app.post('/events/:apt_id', utils.verifyToken, async (req, res) => {
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
app.put('/events/:apt_id/:event_id', utils.verifyToken, async (req, res) => {
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
app.delete('/events/:event_id', utils.verifyToken, async (req, res) => {
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
app.get('/products', utils.verifyToken, async (req, res) => {
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
app.get('/shopping/:apt_id', utils.verifyToken, async (req, res) => {
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
app.post('/shopping/:apt_id', utils.verifyToken, async (req, res) => {
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
app.put('/shopping/:apt_id/:item_id', utils.verifyToken, async (req, res) => {
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
app.delete('/shopping/:item_id', utils.verifyToken, async (req, res) => {
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
app.get('/tasks', utils.verifyToken, async (req, res) => {
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
app.get('/tasks/:apt_id', utils.verifyToken, async (req, res) => {
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
app.get('/task/:user_id', utils.verifyToken, async (req, res) => {
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
 * Insert new task.
 * MieszkaniecWMieszkaniuID jest tablica, niewazne czy z jednym czy z n elementami
 */
app.post('/tasks', utils.verifyToken, async (req, res) => {
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

        for (let i = 0; i < MieszkaniecWMieszkaniuID.length; i++) {
            await ops.insert(db.MIEJSCE_W_KOLEJCE_TABLE, {
                Miejsce: i + 1,
                MieszkaniecWMieszkaniuID: MieszkaniecWMieszkaniuID[i],
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
 * I assume that task_id is Obowiazek_ID.
 * Updateujemy tyle osob ile bylo na poczatku.
 */
app.put('/tasks/:task_id', utils.verifyToken, async (req, res) => {
    const {
        Opis,
        Powtarzalnosc,
        MieszkaniecWMieszkaniuID,
        Rozpoczecie
    } = req.body

    try {
        await ops.update(db.OBOWIAZEK_TABLE, db.OBOWIAZEK_TABLE_ID, req.params.task_id, {
            Opis
        })

        // Nie updatuje aktualnego miejsca w cyklu, niech zostanie takie jakie jest, podmieniam tylko osoby
        await ops.update(db.PRZYDZIAL_TABLE, db.OBOWIAZEK_TABLE_ID, req.params.task_id, {
            Powtarzalnosc,
            Rozpoczecie
        })

        const getPrzydzial = await ops.getById(db.PRZYDZIAL_TABLE, db.OBOWIAZEK_TABLE_ID, req.params.task_id)

        for (let i = 0; i < MieszkaniecWMieszkaniuID.length; i++) {
            await ops.updateQueue(db.MIEJSCE_W_KOLEJCE_TABLE, db.PRZYDZIAL_TABLE_ID, i + 1, getPrzydzial[0].PrzydzialID, {
                MieszkaniecWMieszkaniuID: MieszkaniecWMieszkaniuID[i]
            })
        }

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err)
    }
})


/**
 * Update AktualneMiejsceWCyklu.
 * task_id means ObowiazekID.
 * pay attention to url.
 */
app.put('/tasks/cycle/:task_id', utils.verifyToken, async (req, res) => {
    const {
        AktualneMiejsceWCyklu
    } = req.body

    try {
        const tasks = await ops.getAllocationForTask(req.params.task_id)
        // if there is only one person assigned
        if (tasks.length === 1) {
            await ops.update(db.PRZYDZIAL_TABLE, db.PRZYDZIAL_TABLE_ID, tasks[0].PrzydzialID, {
                AktualneMiejsceWCyklu: 1
            })
        }
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
 */
app.delete('/tasks/:task_id', utils.verifyToken, async (req, res) => {
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
app.get('/users/:apt_id', utils.verifyToken, async (req, res) => {
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

// REGISTRATION
/**
 * Register user and assign token
 */
app.post('/users', async (req, res) => {
    let {
        Login,
        Haslo,
        Email
    } = req.body

    Haslo = utils.generatePassword(req.body.Haslo)
    try {
        const {
            insertId
        } = await ops.insert(db.MIESZKANIEC_TABLE, {
            Login,
            Haslo,
            Email
        })

        const token = jwt.sign({
            id: insertId
        }, config.secretKey, {
            expiresIn: "30 days"
        })

        res.status(200)
        res.send({
            auth: true,
            token: token,
            id: insertId,
            message: null
        })
    } catch (err) {
        res.status(500).send(err)
    }

})

/**
 * Token testing
 */
app.get('/tokenTest', utils.verifyToken, async (req, res) => {
    const token = req.headers['x-access-token']
    if (!token)
        return res.status(401).send({
            auth: false,
            token: null,
            id: null,
            message: 'No token provided!'
        })

    jwt.verify(token, config.secretKey, {}, (err, decoded) => {
        if (err)
            return res.status(500).send({
                auth: false,
                token: null,
                id: null,
                message: 'Failed to authenticate token'
            })

        res.status(200).send(decoded)
    })
})

// LOGIN
/**
 * Login user and get token
 */
app.post('/login', async (req, res) => {
    const {
        Login,
        Haslo
    } = req.body

    try {
        const user = await ops.getById(db.MIESZKANIEC_TABLE, db.MIESZKANIEC_TABLE_LOGIN, Login)

        if (user.length === 0)
            return res.status(404).send({
                auth: false,
                token: null,
                id: null,
                message: "User not found"
            })

        if (!utils.comparePasswords(Haslo, user[0].Haslo))
            return res.status(401).send({
                auth: false,
                token: null,
                id: null,
                message: "Incorrect password"
            })

        const token = jwt.sign({
            id: user[0].MieszkaniecID
        }, config.secretKey, {
            expiresIn: "30 days"
        })

        res.send({
            auth: true,
            token: token,
            id: user[0].MieszkaniecID,
            message: null
        })

    } catch (err) {
        res.status(500).send({
            auth: false,
            token: null,
            id: null,
            message: err
        })
    }
})

// JOIN APARTMENT
/**
 * User joining apartment using the access code
 */
app.post('/apartments/join', utils.verifyToken, async (req, res) => {
    const {
        KodDostepu,
        MieszkaniecID
    } = req.body

    try {
        const resultMieszkanie = await ops.getById(db.MIESZKANIE_TABLE, db.MIESZKANIE_TABLE_KOD, KodDostepu)

        if (resultMieszkanie.length === 0)
            res.sendStatus(404)


        await ops.insert(db.MIESZKANIEC_W_MIESZKANIU_TABLE, {
            MieszkaniecID: MieszkaniecID,
            MieszkanieID: resultMieszkanie[0].MieszkanieID
        })

        res.status(200).send(resultMieszkanie)

    } catch (err) {
        res.status(500).send(err)
    }
})