const express = require("express");

const routers = express.Router();
const usersController = require('../controllers/userController');

routers.get('/get-users', usersController.getUsers);
routers.post('/create-user', usersController.createUser);
routers.patch('/update-user/:id', usersController.updateUser);
routers.delete('/delete-user/:id', usersController.deleteUser);



routers.get('/product-script', usersController.productsScript);

module.exports = routers;  

// 650c20f59dda84d671dddfcc
