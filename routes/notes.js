const notes = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const {
    readFromFile,
    readAndAppend,
    writeToFile,
} = require('../helpers/fsUtils');


// GET /api/notes should read the db.json file and return all saved notes as JSON.

notes.get('/', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// GET /api/notes/:id should read the db.json file and return the note with the specific ID.

notes.get('/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            // Make a new array with only the note of the ID provided in the URL
            const result = json.filter((note) => note.id === noteId);

            // Save that array to the filesystem
            writeToFile('./db/db.json', result);

            // return the note with that ID if it exists request
            return result.length > 0
                ? res.json(result)
                : res.json('No note with that ID');
        });
});



// POST /api/notes should receive a new note to save on the request body, add it to the db.json file, 
// and then return the new note to the client. 
notes.post('/', (req, res) => {
    console.log(req.body);

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.error('Error in adding note');
    }
});


// DELETE /api/notes/:id should receive a query parameter containing the id of a note to delete. 

notes.delete('/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            // Make a new array of all notes except the one with the ID provided in the URL
            const result = json.filter((note) => note.id !== noteId);

            // Save that array to the filesystem
            writeToFile('./db/db.json', result);

            // Respond to the DELETE request
            res.json(`Item ${noteId} has been deleted 🗑️`);
        });
});


module.exports = notes;