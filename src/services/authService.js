import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

// only send safe fields to the client
const cleanUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  address: user.address || "",
});

export const authService = {
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email and password are required");
    }
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    const cleanEmail = email.toLowerCase().trim();
    const exists = await userRepository.findByEmail(cleanEmail);
    if (exists) throw new ApiError(409, "This email is already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    return { user: cleanUser(user), token: generateToken(user) };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) throw new ApiError(401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    if (!user.isActive) throw new ApiError(403, "This account is disabled");

    return { user: cleanUser(user), token: generateToken(user) };
  },

  cleanUser,
};
