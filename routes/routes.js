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

module.exports = router // Esporta il router
