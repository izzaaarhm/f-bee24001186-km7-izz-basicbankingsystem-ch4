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

module.exports = {
    userSchema,
    profileSchema,
    bankAccountSchema,
    withdrawSchema,
    depositSchema,
    transactionSchema
};
