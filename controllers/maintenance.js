const Maintenance = require("../models/maintenance"); // Importa il modello Maintenance
const Vehicle = require("../models/vehicle"); // Importa il modello Vehicle
const nodemailer = require("nodemailer"); // Importa nodemailer per l'invio di email

// Funzione per ottenere tutte le manutenzioni
const getAllMaintenances = async (req, res, next) => {
    try {
        const maintenances = await Maintenance.find({}); // Recupera tutte le manutenzioni dal database
        return res.json(maintenances); // Restituisce le manutenzioni come risposta JSON
    } catch (err) {
        return res.status(500).json({ error: err.message }); // Gestisce eventuali errori e restituisce un errore con stato 500
    }
};

// Funzione per creare una nuova manutenzione
const createNewMaintenance = async (req, res, next) => {
    try {
        const existingVehicle = await Vehicle.findOne({ vin: req.body.vehicle_vin }); // Cerca il veicolo con il VIN specificato
        if (!existingVehicle || existingVehicle.status !== "under maintenance") {
            // Se il veicolo non esiste o non è sotto manutenzione
            return res.status(403).json({ err: "Macchina non esistente o non sotto manutenzione" }); // Restituisce un errore con stato 403
        } else {
            // Se il veicolo esiste ed è sotto manutenzione
            const dateMaintenance = Date.now(); // Ottiene la data attuale

            // Crea un nuovo oggetto Maintenance con i dettagli forniti
            const newMaintenance = Maintenance({
                vehicle_vin: req.body.vehicle_vin, // VIN del veicolo
                date: dateMaintenance, // Data della manutenzione (ora)
                type: req.body.type, // Tipo di manutenzione
                details: req.body.details || "", // Dettagli della manutenzione (opzionale)
                next_due_date: dateMaintenance + (req.body.occurence * 24 * 60 * 60 * 1000), // Calcola la data della prossima scadenza
                notified: false // Imposta lo stato della notifica su false
            });

            const savedMaintenance = await newMaintenance.save(); // Salva la nuova manutenzione nel database
            return res.status(201).json(savedMaintenance); // Restituisce la manutenzione salvata con stato 201
        }
    } catch (err) {
        return res.status(500).json({ error: err.message }); // Gestisce eventuali errori e restituisce un errore con stato 500
    }
};

// Funzione per notificare la scadenza delle manutenzioni
const notifyExpiration = async (req, res, next) => {
    try {
        // Trova tutte le manutenzioni con la prossima scadenza maggiore o uguale alla data corrente
        const maintenances = await Maintenance.find({ next_due_date: { $gte: new Date(Date.now()) } });

        // Itera su ciascuna manutenzione
        for (const maintenance of maintenances) {
            const date1 = Date.now(); // Ottieni la data corrente in millisecondi

            const date2 = new Date(maintenance.next_due_date).getTime(); // Ottieni il valore numerico della data di scadenza in millisecondi

            const diffInMillis = date2 - date1; // Calcola la differenza in millisecondi
            const diffInDays = diffInMillis / (1000 * 60 * 60 * 24); // Converti la differenza in giorni

            // Se la differenza è inferiore o uguale a 3 giorni e non è stata inviata una notifica
            if (diffInDays <= 3.0 && maintenance.notified == false) {
                const vehicle = await Vehicle.findOne({ vin: maintenance.vehicle_vin }); // Trova il veicolo associato alla manutenzione
                
                // Configura il trasportatore per l'invio delle email
                const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "fakeautomotive@gmail.com", // Indirizzo email del mittente
                        pass: process.env.PASSWORD_EMAIL // Password email presa dalle variabili d'ambiente
                    }
                });

                // Definisce le opzioni dell'email
                const mailOptions = {
                    from: "fakeautomotive@gmail.com",
                    to: vehicle.current_owner_email, // Email del proprietario del veicolo
                    subject: "Reminder to do maintenance", // Oggetto dell'email
                    text: `Reminder to do maintenance` // Testo dell'email
                };

                try {
                    const info = await transporter.sendMail(mailOptions); // Invia l'email
                    console.log("Email sent: ", info.response);
                    await Maintenance.findOneAndUpdate({ vehicle_vin: maintenance.vehicle_vin }, { notified: true }); // Aggiorna lo stato della notifica su true
                } catch (error) {
                    console.error("Error sending email: ", error); // Gestisce eventuali errori durante l'invio dell'email
                }
            }
        }

        return res.status(200).json({ msg: "ok" }); // Risposta con stato 200 per successo
    } catch (err) {
        console.error(err); // Log dell'errore nel server
        return res.status(500).json({ error: err.message }); // Risposta con stato 500 per errore
    }
};

module.exports = {
    getAllMaintenances, // Esporta la funzione getAllMaintenances
    createNewMaintenance, // Esporta la funzione createNewMaintenance
    notifyExpiration // Esporta la funzione notifyExpiration
};
