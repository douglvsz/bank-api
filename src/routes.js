import express from 'express';
import userctrl from './controllers/userctrl.js';
import { auth } from './middlewares/auth.js';

const router = express.Router();

//Public
router.post('/register', userctrl.singUp);
router.post('/login', userctrl.singIn);

//Private
router.post('/deposit', auth, userctrl.deposito);
router.post('/transfer', auth, userctrl.transfer);
router.get('/consult', auth, userctrl.consult);
router.post('/changepass', auth, userctrl.changePass);

export default router;

