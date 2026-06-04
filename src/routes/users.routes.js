const router = require('express').Router();
const ctrl = require('../controllers/users.controller');

router.get('/',     ctrl.getUsers);
router.get('/:id',  ctrl.getUserById);
router.post('/',    ctrl.createUser);
router.put('/:id',  ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
