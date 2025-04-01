import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';

// Temporary user data (would typically come from a database)
const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get all users
 * @route GET /api/users
 */
export const getUsers = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user by ID
 * @route GET /api/users/:id
 */
export const getUserById = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User not found with id ${req.params.id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * @route POST /api/users
 */
export const createUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { name, email } = req.body;

    // Simple validation
    if (!name || !email) {
      res.status(400).json({
        success: false,
        message: 'Please provide name and email',
      });
      return;
    }

    // Check if email already exists
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user by ID
 * @route PUT /api/users/:id
 */
export const updateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: `User not found with id ${req.params.id}`,
      });
      return;
    }

    const updatedUser = {
      ...users[userIndex],
      ...req.body,
      id: users[userIndex].id, // Ensure ID doesn't change
    };

    users[userIndex] = updatedUser;

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user by ID
 * @route DELETE /api/users/:id
 */
export const deleteUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: `User not found with id ${req.params.id}`,
      });
      return;
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    res.status(200).json({
      success: true,
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
}; 