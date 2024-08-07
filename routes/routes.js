const express = require('express') // Importa il modulo express
const router  = express.Router(); // Crea un nuovo router
const userController = require('../controllers/user'); // Importa il controller per gli utenti
const vehicleController = require('../controllers/vehicle'); // Importa il controller per i veicoli
const saleController = require('../controllers/sale'); // Importa il controller per le vendite
const maintenanceController = require('../controllers/maintenance'); // Importa il controller per la manutenzione

const multer = require("multer"); // Importa multer per il caricamento dei file
const upload = multer(); // Configura multer

// Definisce le route per ottenere gli utenti, amministratori e clienti
router.get('/api/users', userController.getAllUsers);
router.get('/api/admins', userController.getAllAdmins);
router.get('/api/customers', userController.getAllCustomers);

// Definisce le route per creare nuovi amministratori e clienti
router.post('/api/new_admin', userController.createNewAdmin);
router.post('/api/new_customer', userController.createNewCustomer);

// Definisce le route per ottenere i veicoli, in vendita e in manutenzione
router.get('/api/vehicles', vehicleController.getAllVehicles)
router.get('/api/on_sale_vehicles', vehicleController.getAllOnSaleVehicles)
router.get('/api/under_maintenance_vehicles', vehicleController.getAllUnderMaintenanceVehicles)

// Definisce la route per creare nuovi veicoli in archivio
router.post('/api/new_vehicle', vehicleController.createNewVehicle)

// Definisce le route per ottenere tutte le vendite
router.get('/api/sales', saleController.getAllSales)

// Definisce la route per inserire una nuova vendita
router.post('/api/new_sales', saleController.createNewSales)

// Definisce le route per ottenere tutte le manutenzioni effettuate
router.get('/api/maintenances', maintenanceController.getAllMaintenances)

// Definisce la route per inserire una nuova manutenzione
router.post('/api/new_maintenance', maintenanceController.createNewMaintenance)

// Definisce la route per notificare le scadenze imminenti
router.get('/api/notify_expiration', maintenanceController.notifyExpiration)

module.exports = router // Esporta il router
