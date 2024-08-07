const mongoose = require("mongoose");

// Definizione dello schema per la collezione Vehicles
const vehicleSchema = new mongoose.Schema({
    // Campo make: stringa richiesta (marca del veicolo)
    make : {
        type : String, 
        required : true
    },
    // Campo model: stringa richiesta (modello del veicolo)
    model : {
        type : String, 
        required : true
    },
    // Campo year: stringa richiesta (anno di produzione del veicolo)
    year : {
        type : String, 
        required : true
    },
    // Campo vin: stringa richiesta (Vehicle Identification Number)
    vin : {
        type : String,
        required : true
    },
    // Campo status: stringa con valori predefiniti "on sale" o "under maintenance"
    status : {
        type : String,
        enum : ["on sale", "under maintenance", "sold", ""]
    },
    // Campo current_owner_id: stringa opzionale (ID del proprietario attuale)
    current_owner_email : {
        type : String
    }
});

// Creazione del modello Vehicle basato sullo schema definito
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Esportazione del modello Vehicle per poter essere utilizzato in altri moduli
module.exports = Vehicle;
