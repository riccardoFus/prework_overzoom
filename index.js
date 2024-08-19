const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); // Importa il modello User
require('dotenv').config(); // Carica le variabili d'ambiente dal file .env
const bcrypt = require('bcrypt');

// Funzione per generare l'hash della password
async function hashPassword(password) {
    const saltRounds = 10; // Maggiore è il numero di salt rounds, più sicuro è l'hash, ma più lento da generare
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error("Error hashing password: ", err);
        throw err; // Propaga l'errore per la gestione successiva
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

// Funzione per configurare il primo amministratore
async function setupFirstAdmin() {
    try {
        // Connessione a MongoDB
        await mongoose.connect(process.env.URL_DB);
        console.log('Connected to MongoDB');

        // Hash della password dell'amministratore
        const hashedPassword = await hashPassword(process.env.PASSWORD_ADMIN_1);

        // Creazione del primo amministratore
        const firstAdmin = new User({
            username: 'admin1',
            email: 'admin@automotive.com',
            password: hashedPassword,
            confirmed_user: true,
            role: 'admin',
            otp: '',
            otp_expiry: new Date() // Imposta l'OTP expiry alla data corrente
        });

        // Verifica se l'amministratore esiste già
        const adminExists = await checkIfAdminAlreadyExists();
        if (!adminExists) {
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
        console.error('MongoDB connection error:', error);
    }
}

const app = express();
const port = 3000;
const routes = require("./routes/routes");

// Middleware per la gestione dei dati JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware per servire file statici e impostare le rotte
app.use(express.static(__dirname + "/html/"), routes);

// Avvia il server e configura il primo amministratore
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    setupFirstAdmin();
});

// Middleware per il logging delle richieste
app.use((req, res, next) => {
    console.log("called: " + req.method + ' ' + req.url);
    next();
});

/* Default 404 handler */
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
