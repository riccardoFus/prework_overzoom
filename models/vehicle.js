const mongoose = require('mongoose'); // Importa il modulo mongoose

// Definizione dello schema per la collezione "Vehicles"
const vehicleSchema = new mongoose.Schema({
    // Campo make: stringa richiesta (marca del veicolo)
    make: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo model: stringa richiesta (modello del veicolo)
    model: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo year: stringa richiesta (anno di produzione del veicolo)
    year: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo vin: stringa richiesta (Vehicle Identification Number)
    vin: {
        type: String,
        required: true, // Questo campo è obbligatorio
        unique: true // Il VIN deve essere unico per ogni veicolo
    },
    // Campo status: stringa con valori predefiniti "on sale", "under maintenance" o "sold"
    status: {
        type: String,
        enum: ["on sale", "under maintenance", "sold"], // Valori accettabili per lo stato del veicolo
        default: "on sale" // Imposta "on sale" come valore predefinito
    },
    // Campo current_owner_email: stringa opzionale (email del proprietario attuale)
    current_owner_email: {
        type: String
    }
});

// Creazione del modello Vehicle basato sullo schema definito
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Esportazione del modello Vehicle per poter essere utilizzato in altri moduli
module.exports = Vehicle;
