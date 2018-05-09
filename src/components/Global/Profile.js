import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from './PageTitle'
import ProfileImage from './ProfileImage'

export const Logout = () => {
    return (
        <a id="logout" onClick={(e) => {
            e.preventDefault();
            firebase.auth().signOut();
        }}>LogOut</a>
    )
}

export default class Profile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            userDetails: null
        }

        this.renderUserStats = this.renderUserStats.bind(this)
    }

    componentWillMount() {
        const _this = this;
        let userRef = firebase.database().ref(`users/${this.state.user.uid}`);
        
        userRef.once('value', (snap) => {
            _this.setState({
                userDetails: snap.val()
            })
        })
    }

    renderUserStats() {
        let { userDetails } = this.state;
        let badgeLength = Object.keys(userDetails.badges_earned).length;
        let stats = [
            {
                name: 'Points',
                value: userDetails.points,
                theme: 'red'
            },
            {
                name: 'Achievements',
                value: badgeLength,
                theme: 'purple'
            }
        ]

        let allStats = stats.map((stat, key) => {
            return (
                <div onClick={ () => this.badgeView(stat.name) } className={`stat ${stat.theme}`} key={`${stat.name}__${key}`}>
                        <strong>{
                            stat.value !== null && typeof stat.value !== 'undefined' ? stat.value : '0'
                        }</strong>
                        <p>{stat.name}</p>
                </div>
            )
        })
        return allStats;
    }

    badgeView(statName) {
        let { userDetails } = this.state;
        console.log(userDetails);
        if (statName === "Achievments") {
            // render badge grid view here
        }
    }

    render() {
        const { user, userDetails } = this.state;

        return (
            <div className="profile-page">
                <PageTitle title="Profile" back={() => this.props.routerProps.history.goBack()} />
                <div className="user-details">
                    <ProfileImage user={user} editable={true} />
                    <p>{ user.displayName !== null ? user.displayName : 'Anonymous Rabbit' }</p>
                    <p>{ user.email.replace('@', '[at]') }</p>
                    <div className={`user-stats ${ userDetails !== null ? 'fadeIn' : '' }`}>
                        { userDetails === null ? ('') : ( this.renderUserStats() ) }
                    </div>
                    <div className="controls">
                        <Link to="/profile/claim" className="btn">Claim Points</Link>
                    </div>
                </div>
            </div>
        )
    }
}