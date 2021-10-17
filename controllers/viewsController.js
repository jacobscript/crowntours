const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(
    async (req, res, next) => {
        // 1) get tour data from collection
        const tours = await Tour.find()

        // 2) build template

        // 3) render template using tour data from 1)
        res.status(200).render('overview', {
            title: 'All Tours',
            tours,
        })
    }
)

exports.getTour = catchAsync(
    async (req, res, next) => {
        // 1) get data for requested tour (including reviews and guides)
        const tour = await Tour.findOne({
            slug: req.params.slug,
        }).populate({
            path: 'reviews',
            fields: 'review rating user',
        })

        if (!tour) {
            return next(
                new AppError(
                    'There is no tour with that name.',
                    404
                )
            )
        }
        // 2) build template

        // 3) render template using data from 1)

        res.status(200)
            .set(
                // 'Content-Security-Policy',
                // "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
                // "connect-src 'self' https://cdnjs.cloudflare.com"
                'Content-Security-Policy',
                "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
            )
            .render('tour', {
                title: `${tour.name} Tour`,
                tour,
            })
    }
)

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    })
}

exports.getSigupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create new account',
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    })
}

exports.getMyTours = catchAsync(
    async (req, res, next) => {
        // 1)find all bookings
        const bookings = await Booking.find({
            user: req.user.id,
        })
        // 2) find tours with the returned IDs
        const tourIDs = bookings.map(
            (el) => el.tour
        )
        const tours = await Tour.find({
            _id: { $in: tourIDs },
        })
        res.status(200).render('overview', {
            title: 'My Tours',
            tours,
        })
    }
)

exports.updateUserData = catchAsync(
    async (req, res, next) => {
        const updatedUser =
            await User.findByIdAndUpdate(
                req.user.id,
                {
                    name: req.body.name,
                    email: req.body.email,
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
        res.status(200).render('account', {
            title: 'Your account',
            user: updatedUser,
        })
    }
)
