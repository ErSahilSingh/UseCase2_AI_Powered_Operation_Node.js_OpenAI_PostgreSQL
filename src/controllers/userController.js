//Standard async controller template
import { createUserService, getAllUsersService, getUserByIdService, updateUserService, deleteUserService } from "../models/userModel.js";  

const handleResponse = (
  res,
  statusCode,
  message,
  data = null
) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
};

export const createUser = async (req, res,next) => {
      const { name, email } = req.body;
    try {
        const user = await createUserService(name, email);
        handleResponse(res, 201, "User created successfully", user);
    } catch (error) {
        next(error);
    }
}

export const getAllUsers = async (req, res,next) => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req, res,next) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id);
        if (!user) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res,next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const user = await updateUserService(id, name, email);
         if (!user) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User updated successfully", user);
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res,next) => {
    try {
        const { id } = req.params;
        const user = await deleteUserService(id);
         if (!user) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User deleted successfully", user);
    } catch (error) {
        next(error);
    }
}
