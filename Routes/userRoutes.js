const router = require("express").Router();

const userController = require('../Controllers/userController.js');
const verifyToken = require('../Controllers/verifyToken');

router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/userInfo', verifyToken, userController.userInfo);
router.put('/updateInfo', verifyToken, userController.userUpdate);
router.delete('/userDelete', verifyToken, userController.userDelete);

module.exports = router;
console.log("user exported router")