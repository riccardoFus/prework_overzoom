const express = require('express')
const router  = express.Router();
const userController = require('../controllers/user');
const vehicleController = require('../controllers/vehicle');
const saleController = require('../controllers/sale');
const maintenanceController = require('../controllers/maintenance');

const multer = require("multer");
const upload = multer();

router.get('/api/users', userController.getAllUsers);
router.get('/api/admins', userController.getAllAdmins);
router.get('/api/customers', userController.getAllCustomers);
router.post('/api/new_admin', userController.createNewAdmin);
router.post('/api/new_customer', userController.createNewCustomer);

module.exports = router