export const createUserValidationSchema = {
    username: {
        notEmpty: {
            msg: "Username cannot be empty"
        },
        isString: {
            msg: "Username must be a string"
        },
        isLength: {
            options: {
                min: 3,
                max: 32
            }
        }
    }
}