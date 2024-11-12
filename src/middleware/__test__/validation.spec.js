const { 
    userSchema, 
    profileSchema, 
    bankAccountSchema, 
    withdrawSchema, 
    depositSchema, 
    transactionSchema,
    imageSchema 
} = require('../validation');

describe('Validation Schemas', () => {
    describe('userSchema', () => {
        test('harus valid untuk data user yang benar', () => {
            const userData = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'securepassword',
                profile: {
                    identity_type: 'KTP',
                    identity_number: '1234567890',
                    address: 'Jl. Nuh No.1'
                }
            };

            const { error } = userSchema.validate(userData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data user yang salah', () => {
            const invalidUserData = {
                name: 'Jo',
                email: 'invalidemail',
                password: '123',
                profile: {
                    identity_type: 'ID',
                    identity_number: '12345',
                    address: ''
                }
            };

            const { error } = userSchema.validate(invalidUserData);
            expect(error).toBeDefined();
        });
    });

    describe('profileSchema', () => {
        test('harus valid untuk data profile yang benar', () => {
            const profileData = {
                identity_type: 'KTP',
                identity_number: '1234567890',
                address: 'Jl. Nuh No.1'
            };

            const { error } = profileSchema.validate(profileData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data profile yang salah', () => {
            const invalidProfileData = {
                identity_type: 'ID',
                identity_number: '123',
                address: ''
            };

            const { error } = profileSchema.validate(invalidProfileData);
            expect(error).toBeDefined();
        });
    });

    describe('bankAccountSchema', () => {
        test('harus valid untuk data bank account yang benar', () => {
            const bankAccountData = {
                userId: 1,
                bankName: 'Bank BCA',
                bankAccountNumber: '1234567890',
                balance: 1000
            };

            const { error } = bankAccountSchema.validate(bankAccountData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data bank account yang salah', () => {
            const invalidBankAccountData = {
                userId: 'ID',
                bankName: '',
                bankAccountNumber: '123',
                balance: -100
            };

            const { error } = bankAccountSchema.validate(invalidBankAccountData);
            expect(error).toBeDefined();
        });
    });

    describe('withdrawSchema', () => {
        test('harus valid untuk data penarikan yang benar', () => {
            const withdrawData = {
                amount: 500
            };

            const { error } = withdrawSchema.validate(withdrawData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data penarikan yang salah', () => {
            const invalidWithdrawData = {
                amount: -100
            };

            const { error } = withdrawSchema.validate(invalidWithdrawData);
            expect(error).toBeDefined();
        });
    });

    describe('depositSchema', () => {
        test('harus valid untuk data deposit yang benar', () => {
            const depositData = {
                amount: 500
            };

            const { error } = depositSchema.validate(depositData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data deposit yang salah', () => {
            const invalidDepositData = {
                amount: -100
            };

            const { error } = depositSchema.validate(invalidDepositData);
            expect(error).toBeDefined();
        });
    });

    describe('transactionSchema', () => {
        test('harus valid untuk data transaksi yang benar', () => {
            const transactionData = {
                sourceAccountId: 1,
                destinationAccountId: 2,
                amount: 500
            };

            const { error } = transactionSchema.validate(transactionData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data transaksi yang salah', () => {
            const invalidTransactionData = {
                sourceAccountId: 'ID',
                destinationAccountId: 2,
                amount: -500
            };

            const { error } = transactionSchema.validate(invalidTransactionData);
            expect(error).toBeDefined();
        });
    });

    describe('imageSchema', () => {
        test('harus valid untuk data image yang benar', () => {
            const imageData = {
                title: 'Image Title1',
                description: 'Image Description1',
                image: {
                    mimetype: 'image/jpeg'
                }
            };

            const { error } = imageSchema.validate(imageData);
            expect(error).toBeUndefined();
        });

        test('harus tidak valid untuk data image yang salah', () => {
            const invalidImageData = {
                title: 'Image Title2',
                description: 'Image Description2',
                image: {
                    mimetype: 'image/gif'
                }
            };

            const { error } = imageSchema.validate(invalidImageData);
            expect(error).toBeDefined();
        });
    });
});
