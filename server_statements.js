module.exports = {
    performSelectStatement: async function(res, retrieveEmptyArray, funcCall) {
        let retVal
        try {
            const retrieved = await funcCall()
            if(retrieveEmptyArray || retrieved.length > 0) {
                retVal = { status: 'success', data: retrieved }
            }
            else {
                res.status(404)
                retVal = {status: 'fail', message: 'No records found!' }
            }

        } catch(ex) {
            res.status(500)
            retVal = { status: 'error', message: ex }
        }

        res.end(JSON.stringify(retVal))
    },
    performInsertStatement: async function(res, funcCall, retrieveInsertedCall) {
        let retVal
        try {
            const result = await funcCall()
            const inserted = await retrieveInsertedCall(result.insertId)
            retVal = { status: 'success', data: inserted }
        }
        catch(ex) {
            res.status(500)
            retVal = { status: 'error', message: ex }
        }

        res.end(JSON.stringify(retVal))
    },
    performUpdateStatement: async function(res, funcCall, retrieveUpdatedCall) {
        let retVal
        try {
            const result = await funcCall()
            if(result.affectedRows === 0) {
                retVal = { status: 'fail', message: 'No records found!' }
            } else {
                const updated = await retrieveUpdatedCall()
                retVal = { status: 'success', data: updated }
            }
        }
        catch(ex) {
            res.status(500)
            retVal = { status: 'error', message: ex }
        }

        res.end(JSON.stringify(retVal))
    },
    performDeleteStatement: async function(res, funcCall) {
        let retVal
        try {
            const result = await funcCall()
            if(result.affectedRows === 0) {
                retVal = { status: 'fail', message: 'No records found!' }
            }
            else {
                retVal = { status: 'success' }
            }
        }
        catch(ex) {
            res.status(500)
            retVal = { status: 'error', message: ex }
        }
        res.end(JSON.stringify(retVal))
    }
}


