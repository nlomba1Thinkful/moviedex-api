require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

const movies = require('./movies-data-small.js')
const e = require('express')

//VALIDATION
app.use(
    function validateBearerToken(req, res, next) {
    
    const API_TOKEN = process.env.API_TOKEN
    const authVal = req.get('Authorization') || ''
    if (!authVal.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const token = authVal.split(' ')[1]

    if (token !== API_TOKEN) {
        return res.status(401).json({ message: 'Invalid credential'})
    }

    next()
})


//DATABASE
app.get('/movie', (req, res)=>{
    let output = movies
    const {genre, country, avg_vote} = req.query

    for (const [key, value] of Object.entries(req.query)) {
        if (value == '') res.status(400).json({ message: `${key} cannot be left blank.`})
        if (key === 'avg_vote') {
            output = output.filter(film => film[key] >= value)
        }
        if (key !== 'avg_vote' && value !== '') {
            output = output.filter(film => film[key].toLowerCase().includes(value.toLowerCase()))
        }
    }
    res.json(output)
})

app.use((error, rew, res, next)=>{
    let response
    if (process.env.NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost:${PORT}`)
})