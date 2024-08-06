
const mongoose = require("mongoose");

// Definizione dello schema per la collezione Users
const userSchema = new mongoose.Schema({
    // Campo username: stringa richiesta
    username : {
        type : String, 
        required : true
    },
    // Campo email: stringa richiesta
    email : {
        type : String,
        required : true
    },
    // Campo password: stringa richiesta
    password : {
        type : String,
        required : true  
    },
    // Campo confirmed_user: booleano richiesto
    confirmed_user : {
        type : Boolean,
        required : true
    },
    // Campo role: stringa con valori predefiniti "admin" o "customer"
    role : {
        type : String,
        enum : ["admin", "customer"]
    },
    otp: {
        type: String
    },
    otp_expiry: {
        type: Date
    }
});

// Creazione del modello User basato sullo schema definito
const User = mongoose.model('User', userSchema);

// Esportazione del modello User per poter essere utilizzato in altri moduli
module.exports = User;
