import { Router } from 'express';
import {
    getUserById,
    updateUser,
    getAllUsers,
    deleteUser,
    setProfilePictureFromUrl,
    searchUsers,
    updateEmail,
    getAccountInfo,
    recoverPassword,
    getSystemLogs,
    exportAllUsers
} from '../controllers/usersController';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

// Rutas de administración (BFLA: falta checkAdminRole)
router.get('/admin/system-logs', authenticate, getSystemLogs);
router.get('/admin/users/export_all', authenticate, exportAllUsers);

// Rutas generales y de perfil
router.get('/', getAllUsers); // A04: Unrestricted Resource Consumption (?limit=...)
router.post('/profile-picture', setProfilePictureFromUrl); // A07: SSRF
router.put('/profile/update_email', authenticate, updateEmail);
router.get('/search', searchUsers);
router.get('/account/:id', getAccountInfo);
router.post('/recover', recoverPassword);

// Rutas por ID de usuario
router.get('/:id', authenticate, getUserById); // A01: BOLA y A03: Excessive Data Exposure (expone password)
router.put('/:id', authenticate, updateUser); // A03: Mass Assignment (permite alterar role)
router.delete('/:id', authenticate, deleteUser); // A05: BFLA (función administrativa sin verificar rol)

export default router;