import React, { Component } from 'react'
// eslint-disable-next-line
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from './PageTitle';
import Badges from '../config/badges';

export default class Achievements extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            allUserData: null
        }

        this.badgeView = this.badgeView.bind(this)
    }

    componentWillMount() {
        const _this = this;
        let userRef = firebase.database().ref(`users/${this.state.user.uid}`);

        userRef.once('value', (snap) => {
            _this.setState({
                allUserData: snap.val()
            })
        })
    }

    badgeView() {
        let { allUserData } = this.state;
        let badgesArray = allUserData.badges_earned;
        let badgeDataArray = Object.keys(badgesArray);
        console.log(badgeDataArray);
        let allBadges = badgeDataArray.map((item, key) => {
            let badgeName = item.replace(/[_-]/g, " ");
            return (
                <div className="badge-container" key={key}>
                    {/* <Link to="/"> link to individual badge view */}
                        <div className="badge-img" style={{ backgroundImage: `url(${Badges.badgeInfo[item].img})` }} />
                        <h3>{badgeName}</h3>
                    {/* </Link> */}
                </div>
            )
        })
        return allBadges;
    }

    render() {
        // eslint-disable-next-line
        const { user, allUserData } = this.state;

        return (
            <div className="profile-page">
                <PageTitle title="Achievements" back={() => this.props.routerProps.history.goBack()} />
                <div className="user-achievements">
                    { allUserData === null ? ('') : ( this.badgeView() ) }
                </div>
            </div>
        )
    }
}