export const createUserValidationSchema = {
    username: {
        notEmpty: {
            msg: "Username cannot be empty"
        },
        isString: {
            msg: "Username must be a string"
        },
        isLength: {
            max: 10,
            min: 3
        }
    }
}