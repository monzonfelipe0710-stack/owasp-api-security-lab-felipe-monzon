import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import couponRoutes from './routes/coupons';
import './services/Database';

const app = express();
const PORT = process.env.PORT || 3000;

// API8: configuración de seguridad HTTP.
app.disable('x-powered-by');
app.use(helmet());

// Middlewares
app.use(bodyParser.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);

// Ruta de bienvenida
app.get('/', (req: Request, res: Response) => {
    res.send('API de Express.js funcionando.');
});

// Ruta de estado de salud
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// Middleware global de manejo de errores.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error interno del servidor:', err.stack);

    // No exponer detalles internos al cliente.
    res.status(500).json({
        message: 'Ha ocurrido un error interno en el servidor.'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('La base de datos está siendo inicializada por "db.sqlite"...');
});