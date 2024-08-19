const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();
const bcrypt = require('bcrypt')

async function hashPassword(password) {
    const saltRounds = 10; // The higher the salt rounds, the more secure the hash, but also slower to generate
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error("Error hashing password: ", err);
        throw err;
    }
}

// Funzione per verificare se un amministratore esiste già nel database
async function checkIfAdminAlreadyExists() {
    try {
        const admin = await User.findOne({ email: 'admin@automotive.com' });
        return admin !== null; // Restituisce true se l'amministratore esiste, altrimenti false
    } catch (error) {
        console.error("Error checking if admin exists:", error);
        return false; // In caso di errore, restituisce false
    }
}

// Funzione per configurare l'amministratore
function setupFirstAdmin(){
    // Connessione a MongoDB
    mongoose.connect(process.env.URL_DB)
    .then(async () => {
        console.log('Connected to MongoDB');

        const hashedPassword = await hashPassword(process.env.PASSWORD_ADMIN_1)
        
        // Creazione del primo amministratore
        const firstAdmin = new User({
            username: 'admin1',
            email: 'admin@automotive.com',
            password: hashedPassword,
            confirmed_user: true,
            role: 'admin',
            otp: '',
            otp_expiry: Date()
        });

        // Verifica se l'amministratore esiste già
        try {
            const result = await checkIfAdminAlreadyExists();
            if (!result) {
                // Salva il primo amministratore se non esiste
                try {
                    const savedAdmin = await firstAdmin.save();
                    console.log("First admin saved: ", savedAdmin);
                } catch (error) {
                    console.error("Error saving admin: ", error);
                }
            } else {
                console.log("Admin already exists");
            }
        } catch (error) {
            console.error("Error during admin check or save operation:", error);
        }
    })
    .catch((error) => console.error('MongoDB connection error:', error));
}

const app = express();
const port = 3000;
const routes = require("./routes/routes");

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(__dirname + "/html/"), routes);

// Avvia il server
app.listen(port, () => {  
    console.log(`Server running on http://localhost:${port}`);
    setupFirstAdmin()
});

app.use((req, res, next) => {
    console.log("called: " + req.method + ' ' + req.url)
    next()
})

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({error: 'Not found'});
});