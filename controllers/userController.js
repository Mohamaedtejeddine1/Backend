const userModel = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const maxTime = 24 * 60 * 60;
const createToken = (id) => jwt.sign({ id }, "net secret pfe", { expiresIn: maxTime });

// Create User (Candidat or Recruteur)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, profil, offre, cv, lettreMotivation, experiences, competance } = req.body;
        
        if (role !== "candidat" && role !== "recruteur") {
            return res.status(400).json({ message: "Role must be 'candidat' or 'recruteur'" });
        }

        const user = await userModel.create({
            username,
            email,
            password,
            role,
        //     profil,
    
        //     cv,
        //     lettreMotivation,
        //     experiences,
        //     competance
        // 
        });

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update User
exports.updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete User
exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await userModel.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = await userModel.create({ username, email, password, role });
        const token = createToken(user._id);
        res.cookie("jwt_token_9antra", token, { httpOnly: false, maxAge: maxTime * 1000 });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt_token_9antra", token, { httpOnly: false, maxAge: maxTime * 2000 });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout User
exports.logout = async (req, res) => {
    try {
        res.cookie("jwt_token_9antra", "", { httpOnly: false, maxAge: 1 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
