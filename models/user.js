const mongoose = require('mongoose'); // Importa il modulo mongoose

// Definizione dello schema per la collezione "Users"
const userSchema = new mongoose.Schema({
    // Campo username: stringa richiesta (nome utente)
    username: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo email: stringa richiesta (email dell'utente)
    email: {
        type: String,
        required: true, // Questo campo è obbligatorio
        unique: true // L'email deve essere unica per ogni utente
    },
    // Campo password: stringa richiesta (password dell'utente)
    password: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo confirmed_user: booleano richiesto (indica se l'utente è stato confermato)
    confirmed_user: {
        type: Boolean,
        required: true // Questo campo è obbligatorio
    },
    // Campo role: stringa con valori predefiniti "admin" o "customer"
    role: {
        type: String,
        enum: ["admin", "customer"], // Definisce i valori accettabili per il ruolo
        default: "customer" // Imposta "customer" come valore predefinito
    },
    // Campo otp: stringa opzionale (codice OTP per la verifica)
    otp: {
        type: String
    },
    // Campo otp_expiry: data opzionale (data di scadenza dell'OTP)
    otp_expiry: {
        type: Date
    }
});

// Creazione del modello User basato sullo schema definito
const User = mongoose.model('User', userSchema);

// Esportazione del modello User per poter essere utilizzato in altri moduli
module.exports = User;
