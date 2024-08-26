const validator = require('validator');

class CreateUserDto {
    constructor(data) {
        this.displayName = data.displayName;
        this.username = data.username;
        this.password = data.password;
    }

    validate() {
        const errors = [];

        if (this.displayName !== undefined) {
            if (typeof (this.displayName) == 'string') {

                if (!validator.isLength(this.displayName, { min: 3, max: 50 })) {
                    errors.push({
                        property: 'displayName',
                        message: 'Display name must be between 3 and 50 characters',
                    });
                }
            } else {
                errors.push({
                    property: 'displayName',
                    message: 'Display name must be a string',
                });
            }
        }

        if (this.username !== undefined) {
            if (typeof (this.username) == 'string') {

                if (!validator.isLength(this.username, { min: 3, max: 20 })) {
                    errors.push({
                        property: 'username',
                        message: 'Username must be between 3 and 20 characters',
                    });
                }
            } else {
                errors.push({
                    property: 'username',
                    message: 'Username must be a string',
                });
            }
        }

        if (this.password !== undefined) {
            if (typeof (this.password) == 'string') {

                if (!validator.isStrongPassword(this.password)) {
                    errors.push({
                        property: 'password',
                        message: 'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character and must be between 8 and 50 characters',
                    });
                }
                if (!validator.isLength(this.password, { min: 8, max: 50 })) {
                    errors.push({
                        property: 'password',
                        message: 'Password must be between 6 and 50 characters',
                    });
                }
            } else {
                errors.push({
                    property: 'password',
                    message: 'Password must be a string',
                });
            }
        }

        return errors;
    }
}

module.exports = CreateUserDto;