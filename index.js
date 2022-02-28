const express = require('express')
const app = express()
const port = 3000
const sqlite3 = require('sqlite3').verbose();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

const emptyUser = {
    givenName: '',
    surname: '',
    email: '',
    phone: '',
    houseNumber: '',
    street: '',
    suburb: '',
    state: '',
    postcode: '',
    country: '',
}

let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

const getUser = async () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM User`, (err, row) => {
            if (err) {
                reject(err.message)
            }
            if (row === undefined) {
                resolve({})
            }
            resolve(row)
        })    
    });
}

const createUser = async (body) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO User (givenName, surname, email, phone, houseNumber, street, suburb, state, postcode, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        const values = Object.keys(body).map((key) => body[key])
        db.run(query, values, (error) => {
            if (error) {
                reject(error.message)
            }
            resolve(true);
        })
    })
}

db.serialize(() => {
    db.run(`CREATE TABLE User ( id INTEGER PRIMARY KEY AUTOINCREMENT, givenName VARCHAR(255), surname VARCHAR(255), email VARCHAR(255), phone VARCHAR(255), houseNumber VARCHAR(255), street VARCHAR(255), suburb VARCHAR(255), state VARCHAR(255), postcode VARCHAR(255), country VARCHAR(255))`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });
});

app.get('/user', async (req, res) => {
    const user = await getUser();
    if (Object.keys(user).length === 0) {
        await createUser(emptyUser);
    }
    return res.send(user)
})

app.get('/', async (req, res) => {
    res.render('index.html')
})

app.post('/submit', async (req, res) => {
    console.log(req.body)
    if (!Object.keys(req.body)) {
        res.sendStatus(400);
    }
    await createUser(req.body);
    res.redirect('/')
})

app.post('/update', (req, res) => {
    if (!Object.keys(req.body)) {
        res.sendStatus(400);
    }

    const key = Object.keys(req.body)[0]
    const value = req.body[key]

    db.run(`UPDATE user SET ${key} = '${value}' WHERE id = 1`)
    res.sendStatus(200)
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})