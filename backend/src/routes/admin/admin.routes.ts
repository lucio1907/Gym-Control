import { Router } from "express";
import checkAdminSession from "../../middlewares/checkAdminSession.middleware";
import checkSession from "../../middlewares/checkSession.middleware";
import { createAdmin, deleteAdmin, getAdmins, loginAdmin, updateAdmin } from "../../controllers/admins.controller";

const router = Router();

router.get('/get-admins', checkSession, checkAdminSession, getAdmins);

router.post('/create-admin', checkSession, checkAdminSession, createAdmin);
router.post('/login-admin', loginAdmin);

router.put('/update-admin/:id', checkSession, checkAdminSession, updateAdmin);

router.delete('/delete-admin/:id', checkSession, checkAdminSession, deleteAdmin);


export default router;