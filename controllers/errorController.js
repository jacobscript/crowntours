const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(
        /(["'])(?:(?=(\\?))\2.)*?\1/
    )[0]
    console.log(value)
    const message = `Duplicate field value: ${value}. Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(
        (el) => el.message
    )
    const message = `Invalid input data. ${errors.join(
        ', '
    )}`
    return new AppError(message, 400)
}

const handleJWTError = () =>
    new AppError(
        'Invalid token. Please log in again!',
        401
    )

const handleJWTExpiredError = () =>
    new AppError(
        'Your token has expired!. Please log in again!',
        401
    )

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        })
    }
    // rendered website
    console.log(('Error 💣', err))
    return res
        .status(err.statusCode)
        .render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        })
}

const sendErrorProd = (err, req, res) => {
    // a) API
    if (req.originalUrl.startsWith('/api')) {
        // a) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res
                .status(err.statusCode)
                .json({
                    status: err.status,
                    message: err.message,
                })
        }
        // b) Programming or other unknown error: we don't leak error details
        // 1) log error
        console.log(('Error 💣', err))
        // 2) send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        })
    }

    // b) rendered website
    // a) operational, trusted error: send message to client
    if (err.isOperational) {
        console.log(err)
        return res
            .status(err.statusCode)
            .render('error', {
                title: 'Something went wrong!',
                msg: err.message,
            })
    }

    // b) Programming or other unknown error: we don't leak error details
    // 1) log error
    console.log(('Error 💣', err))
    // 2) send generic message
    return res
        .status(err.statusCode)
        .render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later',
        })
}

// const sendErrorDev = (err, req, res) => {
//     // A) API
//     if (req.originalUrl.startsWith('/api')) {
//         return res.status(err.statusCode).json({
//             status: err.status,
//             error: err,
//             message: err.message,
//             stack: err.stack,
//         })
//     }

//     // B) RENDERED WEBSITE
//     console.error('ERROR 💥', err)
//     return res
//         .status(err.statusCode)
//         .render('error', {
//             title: 'Something went wrong!',
//             msg: err.message,
//         })
// }

// const sendErrorProd = (err, req, res) => {
//     // A) API
//     if (req.originalUrl.startsWith('/api')) {
//         // A) Operational, trusted error: send message to client
//         if (err.isOperational) {
//             return res
//                 .status(err.statusCode)
//                 .json({
//                     status: err.status,
//                     message: err.message,
//                 })
//         }
//         // B) Programming or other unknown error: don't leak error details
//         // 1) Log error
//         console.error('ERROR 💥', err)
//         // 2) Send generic message
//         return res.status(500).json({
//             status: 'error',
//             message: 'Something went very wrong!',
//         })
//     }

//     // B) RENDERED WEBSITE
//     // A) Operational, trusted error: send message to client
//     if (err.isOperational) {
//         console.log(err)
//         return res
//             .status(err.statusCode)
//             .render('error', {
//                 title: 'Something went wrong!',
//                 msg: err.message,
//             })
//     }
//     // B) Programming or other unknown error: don't leak error details
//     // 1) Log error
//     console.error('ERROR 💥', err)
//     // 2) Send generic message
//     return res
//         .status(err.statusCode)
//         .render('error', {
//             title: 'Something went wrong!',
//             msg: 'Please try again later.',
//         })
// }

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (
        process.env.NODE_ENV === 'production'
    ) {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error = Object.create(err)
        // let error = { ...err }
        // error.message = err.message
        if (error.name === 'CastError')
            error = handleCastErrorDB(err)

        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error)

        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError()
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError()

        sendErrorProd(error, req, res)
    }
}
