function sanitizeUser(user) {
    if (!user) return null;

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

module.exports = sanitizeUser;