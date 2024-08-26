const validator = require('validator');

class RefreshTokenDto {
    constructor(data) {
        this.refreshToken = data.refreshToken;
    }

    validate() {
        const errors = [];

        if (this.refreshToken !== undefined) {
            if (typeof (this.refreshToken) == 'string') {

                
            } else {
                errors.push({
                    property: 'refreshToken',
                    message: 'refreshToken must be a string',
                });
            }
        }

        

        return errors;
    }
}

module.exports = RefreshTokenDto;