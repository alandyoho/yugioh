export default {
    fullName: {
        title: 'Full name',
        validate: [{
            validator: 'isLength',
            arguments: [1, 23],
            message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
        }]
    },
    username: {
        title: 'Username',
        validate: [{
            validator: 'isLength',
            arguments: [3, 16],
            message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
        }, {
            validator: 'matches',
            arguments: /^[a-zA-Z0-9]*$/,
            message: '{TITLE} can contains only alphanumeric characters'
        }]
    },
    password: {
        title: 'Password',
        validate: [{
            validator: 'isLength',
            arguments: [6, 16],
            message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
        }]
    },
    emailAddress: {
        title: 'Email address',
        validate: [{
            validator: 'isLength',
            arguments: [6, 255],
        }, {
            validator: 'isEmail',
        }]
    },
}