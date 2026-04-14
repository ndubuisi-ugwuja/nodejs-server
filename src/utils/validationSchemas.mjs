export const createUserValidationSchema = {
    username: {
        notEmpty: {
            errorMessage: "Username cannot be empty"
        },
        isString: {
            errorMessage: "Username must be a string"
        },
        isLength: {
            options: {
                min: 3,
                max: 32
            },
            errorMessage: "Must be between 3 and 32 chars"
        }
    },
    password: {
        notEmpty: {
            errorMessage: "Password cannot be empty"
        },
        isString: {
            errorMessage: "Password must be a string"
        },
        isLength: {
            options: {
                min: 3,
                max: 32
            },
            errorMessage: "Must be between 3 and 32 chars"
        }
    },
}