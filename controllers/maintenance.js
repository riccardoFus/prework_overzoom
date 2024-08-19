const Maintenance = require("../models/maintenance"); // Importa il modello Maintenance
const Vehicle = require("../models/vehicle"); // Importa il modello Vehicle
const nodemailer = require("nodemailer"); // Importa nodemailer per l'invio di email

// Funzione per ottenere tutte le manutenzioni
const getAllMaintenances = async (req, res, next) => {
    try {
        // Recupera tutte le manutenzioni dal database
        const maintenances = await Maintenance.find({});
        // Restituisce le manutenzioni come risposta JSON
        return res.json(maintenances);
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per creare una nuova manutenzione
const createNewMaintenance = async (req, res, next) => {
    try {
        // Cerca il veicolo con il VIN specificato
        const existingVehicle = await Vehicle.findOne({ vin: req.body.vehicle_vin });

        if (!existingVehicle || existingVehicle.status !== "under maintenance") {
            // Se il veicolo non esiste o non è sotto manutenzione, restituisce un errore con stato 403
            return res.status(403).json({ err: "Macchina non esistente o non sotto manutenzione" });
        }

        // Ottiene la data attuale
        const dateMaintenance = Date.now();

        // Crea un nuovo oggetto Maintenance con i dettagli forniti
        const newMaintenance = new Maintenance({
            vehicle_vin: req.body.vehicle_vin, // VIN del veicolo
            date: dateMaintenance, // Data della manutenzione (ora)
            type: req.body.type, // Tipo di manutenzione
            details: req.body.details || "", // Dettagli della manutenzione (opzionale)
            next_due_date: new Date(dateMaintenance + (req.body.occurence * 24 * 60 * 60 * 1000)), // Calcola la data della prossima scadenza
            notified: false // Imposta lo stato della notifica su false
        });

        // Salva la nuova manutenzione nel database
        const savedMaintenance = await newMaintenance.save();
        // Restituisce la manutenzione salvata con stato 201
        return res.status(201).json(savedMaintenance);
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
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
            if (diffInDays <= 3.0 && !maintenance.notified) {
                // Trova il veicolo associato alla manutenzione
                const vehicle = await Vehicle.findOne({ vin: maintenance.vehicle_vin });

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
                    text: `Reminder: The maintenance for your vehicle (VIN: ${maintenance.vehicle_vin}) is due soon. Please take necessary actions.` // Testo dell'email
                };

                try {
                    // Invia l'email
                    const info = await transporter.sendMail(mailOptions);
                    console.log("Email sent: ", info.response);
                    // Aggiorna lo stato della notifica su true
                    await Maintenance.findOneAndUpdate({ vehicle_vin: maintenance.vehicle_vin }, { notified: true });
                } catch (error) {
                    // Gestisce eventuali errori durante l'invio dell'email
                    console.error("Error sending email: ", error);
                }
            }
        }

        // Risposta con stato 200 per successo
        return res.status(200).json({ msg: "ok" });
    } catch (err) {
        // Log dell'errore nel server e risposta con stato 500 per errore
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere il report delle manutenzioni
const getMaintenanceReport = async (req, res, next) => {
    try {
        // Estrazione dei parametri dal corpo della richiesta
        const { startDate, endDate, customer_email, vehicle_vin } = req.body;

        // Costruzione del filtro dinamico basato sui parametri forniti
        let filter = {};

        // Filtro basato sulle date
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            filter.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            filter.date = { $lte: new Date(endDate) };
        }

        // Filtro basato sul VIN del veicolo
        if (vehicle_vin) {
            filter.vehicle_vin = vehicle_vin;
        }

        // Filtro basato sull'email del cliente
        if (customer_email) {
            // Ottieni i VIN dei veicoli posseduti dal cliente
            const vehicles = await Vehicle.find({ current_owner_email: customer_email }).select("vin");
            const vins = vehicles.map(vehicle => vehicle.vin);
            filter.vehicle_vin = { $in: vins };
        }

        // Trova le manutenzioni in base al filtro costruito
        const maintenances = await Maintenance.find(filter);

        // Risposta con i dati filtrati
        return res.status(200).json({ maintenances });
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
    }
};

// Esporta le funzioni del controller
module.exports = {
    getAllMaintenances, // Esporta la funzione per ottenere tutte le manutenzioni
    createNewMaintenance, // Esporta la funzione per creare una nuova manutenzione
    notifyExpiration, // Esporta la funzione per notificare la scadenza delle manutenzioni
    getMaintenanceReport // Esporta la funzione per ottenere il report delle manutenzioni
};
