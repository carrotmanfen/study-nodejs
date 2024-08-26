const validator = require('validator');

class LoginUserDto {
    constructor(data) {
        this.username = data.username;
        this.password = data.password;
    }

    validate() {
        const errors = [];

        if (this.username !== undefined) {
            if (typeof (this.username) == 'string') {

            } else {
                errors.push({
                    property: 'username',
                    message: 'Username must be a string',
                });
            }
        }

        if (this.password !== undefined) {
            if (typeof (this.password) == 'string') {

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

module.exports = LoginUserDto;