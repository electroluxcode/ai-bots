import { Router } from 'express';
import userRoutes from './userRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// User routes
router.use('/users', userRoutes);

// Add other routes here

export default router; 