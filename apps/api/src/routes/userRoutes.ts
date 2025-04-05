import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';

const router: Router = Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private
 */
router.get('/', getUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private
 */
router.post('/', createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update user by ID
 * @access Private
 */
router.put('/:id', updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user by ID
 * @access Private
 */
router.delete('/:id', deleteUser);

export default router; 