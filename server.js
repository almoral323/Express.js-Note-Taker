const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const app = express();
const PORT = process.env.PORT || 3001;

const notesDB = require("./Develop/db/db.json");

app.use(express.static("Develop/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    readFileAsync('./Develop/db/db.json').then(data => {
        let savenewNote = JSON.parse(data);
        res.json(savenewNote);
    })

})

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    let response;
    const note = { ...req.body, id: Date.now() }

    if (req.body && req.body.title) {
        response = {
            status: 'success',
            data: note,
        };
        res.status(201).json(response);
    } else {
        res.status(400).json('Request body must at least contain a title');
    }

    readFileAsync('./Develop/db/db.json').then(data => {
        let allNotes = JSON.parse(data)
        return [...allNotes, note]
    }).then(data => {
        writeFileAsync("./Develop/db/db.json", JSON.stringify(data)).then(data => {
            res.json(data)
        });
    })
    console.log(req.body);
});


app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    readFileAsync('./Develop/db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            const index = json.findIndex(note => note.id == req.params.id)
            json.splice(index, 1)
            writeFileAsync("./Develop/db/db.json", JSON.stringify(json)).then(data => {
                res.json(json)
            });
        })
})

app.listen(PORT, () =>
    console.info(`Listening at http:localhost:${PORT}`)
);