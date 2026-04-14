export const createUserValidationSchema = {
    username: {
        notEmpty: {
            errorMessage: "name cannot be empty"
        },
        isString: {
            errorMessage: "name must be a string"
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
}