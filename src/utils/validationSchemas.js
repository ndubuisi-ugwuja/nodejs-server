export const createUserValidationSchema = {
    username: {
        isLength: {
            max: 10,
            min: 3
        },
        notEmpty: {
            msg: "Username cannot be empty"
        }
    }
}