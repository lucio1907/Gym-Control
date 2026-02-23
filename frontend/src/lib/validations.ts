export const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateDNI = (dni: string) => {
    return /^\d{7,8}$/.test(dni);
};

export const validatePhone = (phone: string) => {
    // Basic validation for numbers and minimum length for Argentina (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10;
};

export const validatePassword = (password: string) => {
    return password.length >= 8;
};

export const validateName = (name: string) => {
    return name.trim().length >= 2;
};
