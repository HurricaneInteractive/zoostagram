import attempted_one from '../../images/badges/attempted_one.png'
import attempted_five from '../../images/badges/attempted_five.png'
import attempted_ten from '../../images/badges/attempted_ten.png'
import completed_one from '../../images/badges/completed_one.png'
import completed_five from '../../images/badges/completed_five.png'
import completed_ten from '../../images/badges/completed_ten.png'

export default {
    badges: [
        "attempted_one",
        "attempted_five",
        "attempted_ten",
        "completed_one",
        "completed_five",
        "completed_ten",
    ],
    badgeInfo: {
        attempted_one: {
            about: "Rewarded for attemting your first quiz",
            img: attempted_one
        },
        attempted_five: {
            about: "Rewarded for attemting quizes five times",
            img: attempted_five
        },
        attempted_ten: {
            about: "Rewarded for attemting quizes ten times",
            img: attempted_ten
        },
        completed_one: {
            about: "Rewarded for 100% completing one your first quiz",
            img: completed_one
        },
        completed_five: {
            about: "Rewarded for 100% completing five quizes",
            img: completed_five
        },
        completed_ten: {
            about: "Rewarded for 100% completing ten quizes",
            img: completed_ten
        }
    }
}