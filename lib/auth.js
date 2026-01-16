import bcrypt from 'bcryptjs';
export { signToken, verifyToken } from './jwt';

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(plainText, hashedPassword) {
    return await bcrypt.compare(plainText, hashedPassword);
}
