import express from 'express';

import { signup, login, allowIfLoggedin, getUser, getUsers, updateUser, deleteUser, grantAccess} from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.get('/user/:userId', allowIfLoggedin, getUser);

router.get('/users', allowIfLoggedin, grantAccess('readAny', 'profile'), getUsers);

router.put('/user/:userId', allowIfLoggedin, grantAccess('updateAny', 'profile'), updateUser);

router.delete('/user/:userId', allowIfLoggedin, grantAccess('deleteAny', 'profile'), deleteUser);

export default router;
