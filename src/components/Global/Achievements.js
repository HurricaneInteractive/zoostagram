import React, { Component } from 'react'
// eslint-disable-next-line
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from './PageTitle'

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
            console.log("inside componentWillMount Function (after setState): ");
            console.log(this.state.allUserData);
        })
    }

    badgeView() {
        let { allUserData } = this.state;
        // console.log( this.state );
        console.log("inside badgeView Function: ");
        console.log( allUserData );
        let badgesArray = allUserData.badges_earned;
        let badgeDataArray = Object.keys(badgesArray);
        console.log(badgeDataArray);
        let allBadges = badgeDataArray.map((item, key) => {
            return (
                <div>
                    <h1>{item}</h1>
                </div>
            )
        })
        return allBadges;
        // return (
        //     <div>Achievement Page - wohooo!!!!!</div>
        // )
    }

    render() {
        // eslint-disable-next-line
        const { user, allUserData } = this.state;
        // console.log(userDetails);

        return (
            <div className="profile-page">
                <PageTitle title="Achievements" back={() => this.props.routerProps.history.goBack()} />
                <div className="user-achievments">
                    { allUserData === null ? ('') : ( this.badgeView() ) }
                </div>
            </div>
        )
    }
}