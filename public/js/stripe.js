/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe(
    'pk_test_51JkwUZFnR0O72r8qNAAHX7yqXLW0vdQpnbCVQx9pFjHtVwYI6KuAmzlp0CQAD441S7N9NrZGl1uW54tqwcLmsqlx00JDiT2b93'
)

export const bookTour = async (tourId) => {
    try {
        // 1) get checkout session from api
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        )
        console.log(session)
        // 2) create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        })
    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}
