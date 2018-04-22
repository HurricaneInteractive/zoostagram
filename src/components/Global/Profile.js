import React, { Component } from 'react'
import firebase from '../firebase';

import PageTitle from './PageTitle'

const DefaultUserImage = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
            <path d="M42,2A40,40,0,1,0,82,42,40.015,40.015,0,0,0,42,2Zm0,12A12,12,0,1,1,30,26,11.984,11.984,0,0,1,42,14Zm0,56.8A28.8,28.8,0,0,1,18,57.92c.12-7.96,16-12.32,24-12.32,7.96,0,23.88,4.36,24,12.32A28.8,28.8,0,0,1,42,70.8Z" transform="translate(-2 -2)"/>
        </svg>
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
        let stats = [
            {
                name: 'Points',
                value: userDetails.points,
                theme: 'red'
            },
            {
                name: 'Achievements',
                value: userDetails.achievements,
                theme: 'purple'
            }
        ]

        let allStats = stats.map((stat, key) => {
            return (
                <div className={`stat ${stat.theme}`} key={`${stat.name}__${key}`}>
                    <strong>{
                        state.value !== null && typeof stat.value !== 'undefined' ? stat.value : '0'
                    }</strong>
                    <p>{stat.name}</p>
                </div>
            )
        })

        return allStats;
    }

    render() {
        const { user, userDetails } = this.state;

        return (
            <div className="profile-page">
                <PageTitle title="Profile" back={() => this.props.routerProps.history.goBack()} />
                <div className="user-details">
                    <DefaultUserImage />
                    <p>{ user.displayName !== null ? this.displayName : 'Anonymous Rabbit' }</p>
                    <p>{ user.email.replace('@', '[at]') }</p>
                    <div className={`user-stats ${ userDetails !== null ? 'fadeIn' : '' }`}>
                        { userDetails === null ? ('') : ( this.renderUserStats() ) }
                    </div>
                </div>
            </div>
        )
    }
}