const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = ({ name, email, password }) => {
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
        return "Name is required and must be between 2 and 100 characters";
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return "A valid email address is required";
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long";
    }

    // Require at least one letter and one number for security
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
        return "Password must contain at least one letter and one number";
    }

    return null;
};

const validateLogin = ({ email, password }) => {
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return "A valid email address is required";
    }

    if (!password || typeof password !== "string" || password.length === 0) {
        return "Password is required";
    }

    return null;
};

module.exports = {
    validateRegister,
    validateLogin
};