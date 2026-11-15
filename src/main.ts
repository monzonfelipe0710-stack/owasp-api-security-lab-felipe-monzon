import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import couponRoutes from './routes/coupons';
import deprecatedUserRoutes from './routes/users_v1_deprecated';
import './services/Database'; // Asegurarse de que la base de datos se inicialice

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/v1/users', deprecatedUserRoutes); // API antigua y expuesta

// Ruta de bienvenida
app.get('/', (req: Request, res: Response) => {
    res.send('API de Express.js funcionando.');
});

// Ruta de estado de salud (utilizada por Docker healthcheck)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    res.status(500).send({
        message: 'Ha ocurrido un error interno en el servidor.',
        error: err.message,
        stack: err.stack 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('La base de datos está siendo inicializada por "db.sqlite"...');
});