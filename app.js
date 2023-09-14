const express = require('express')
const bodyParser = require('body-parser')

const { Pool } = require('pg')

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, PORT } = process.env;
const app = express()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true,
}))

// pg connection
const pool = new Pool({
    connectionString: 'postgres://meantechofficial2906:dyYWPna73vQA@ep-broad-dew-39292505.ap-southeast-1.aws.neon.tech/neondb',
    ssl: {
        rejectUnauthorized: false, // Add this for self-signed certificates (usually not recommended for production)
      },
})


const getPgVersion = async () => {
    const query = await 'SELECT version()'
    pool.query(query, (err, result) => {
        if (err) {
          console.error('Error checking PostgreSQL version:', err);
        } else {
          const postgresVersion = result.rows[0].version;
          console.log('PostgreSQL Version:', postgresVersion);
        }
      });
}


// Routes

// Display All
app.get('/api/tasks', async(req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM tasks')
        res.json(rows) 
    } catch (error) {
        console.error('Error Querying items: ', error)
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
})

// Create a Task
app.post('/api/tasks', async(req, res) => {
    const { name } = req.body
    console.log(name)
    try {
        await pool.query('INSERT INTO tasks (name) VALUES ($1)', [name])
        res.status(201).json({
            message: 'Item Added Sucessfully!'
        })
    } catch (error) {
        console.error('Error Inserting the Item: ', error);
        res.status(500).json(
            {
                error: 'Internal Server Error'
            }
        )
    }
})

// Delete a Task
app.post('/api/tasks/delete', async(req, res) => {
    const { name, id } = req.body
    console.log(name, id) 
    try {
        await pool.query('DELETE FROM tasks WHERE id=$1', [id])
        res.status(201).json({
            message: 'Task Deleted Sucessfully'
        })

    } catch (error) {
        console.error(`Error Occured while deleting the item: ${error}`)
        res.status(500).json({
            error: `Internal Server Error and Error is: ${error}`
        })
    }
})

getPgVersion()


const port = process.env.PORT || 3000

app.listen(port, () => {
    try {
        console.log(`Server started on Port ${port}`)
    } catch (error) {
        console.error('Error occured while starting: ', error)
    }
})

