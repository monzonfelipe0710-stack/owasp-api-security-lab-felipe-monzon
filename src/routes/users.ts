
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

import { authenticate, checkAdminRole } from '../middlewares/auth';

const router: Router = Router();

// Rutas administrativas: requieren autenticación y rol de administrador.
router.get('/admin/system-logs', authenticate, checkAdminRole, getSystemLogs);
router.get('/admin/users/export_all', authenticate, checkAdminRole, exportAllUsers);

// Rutas generales y de perfil.
router.get('/', getAllUsers);
router.post('/profile-picture', setProfilePictureFromUrl);
router.put('/profile/update_email', authenticate, updateEmail);
router.get('/search', searchUsers);
router.get('/account/:id', getAccountInfo);
router.post('/recover', recoverPassword);

// Rutas por ID de usuario.
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
