const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profile: Joi.object({
        identity_type: Joi.string().valid('KTP', 'SIM', 'PASSPORT').required(),
        identity_number: Joi.string().min(10).max(20).required(),
        address: Joi.string().required() 
    }).optional()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(), 
    newPassword: Joi.string().min(6).required(),
});

const profileSchema = Joi.object({
    identity_type: Joi.string().valid('KTP', 'SIM', 'PASSPORT').required(),
    identity_number: Joi.string().min(10).max(20).required(),
    address: Joi.string().required() 
});

const bankAccountSchema = Joi.object({
    userId: Joi.number().integer().required(),
    bankName: Joi.string().required(),
    bankAccountNumber: Joi.string().length(10).required(), 
    balance: Joi.number().min(0).required()
});

const withdrawSchema = Joi.object({
    amount: Joi.number().positive().required()
});

const depositSchema = Joi.object({
    amount: Joi.number().positive().required()
});

const transactionSchema = Joi.object({
    sourceAccountId: Joi.number().integer().required(),
    destinationAccountId: Joi.number().integer().required(),
    amount: Joi.number().positive().required()
});

const imageSchema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(3).max(100).required(),
    image: Joi.object({
        mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/jpg').required(),
    }).optional()
});

module.exports = {
    userSchema,
    profileSchema,
    bankAccountSchema,
    withdrawSchema,
    depositSchema,
    transactionSchema,
    imageSchema,
    forgotPasswordSchema, 
    resetPasswordSchema 
};
