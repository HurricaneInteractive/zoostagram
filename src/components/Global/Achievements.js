import React, { Component } from 'react'
// eslint-disable-next-line
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from './PageTitle';
import Badges from '../config/badges';

class BadgeModal extends React.Component {
    render() {
        return (
            <div className="badge-modal" style={this.props.isOpen ? {display: "block"} : {display: "none"} }>
                <div>
                    <div className="badge-close">
                        <p onClick={ this.props.closeModalBox }>X</p>
                    </div>
                    <div>
                        <div className="badge-modal-image" style={{ backgroundImage: `url(${this.props.itemImage})` }}/>
                        <h1>{this.props.itemId}</h1>
                        <h3>{this.props.itemDesc}</h3>
                    </div>
                </div>
            </div>
        )
    }
}


export default class Achievements extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            allUserData: null,
            activeItemDesc: null,
            activeItemName: null,
            activeItemId: null,
            activeItemImage: null,
            isOpen: false,
            openDeleteModal: false
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

    toggleModal() {
        this.setState({
            openDeleteModal: false
        })
    }

    badgeModal(key, item, badgeName, badgeImage) {
        let desc = Badges.badgeInfo[item].about;
        this.setState({
            openDeleteModal: true,
            activeItemName: key,
            activeItemId: badgeName,
            activeItemDesc: desc,
            activeItemImage: badgeImage
        })
    }

    badgeView() {
        let { allUserData } = this.state;
        if (typeof allUserData.badges_earned === 'undefined') {
            return (
                <div>No Badges Earned</div>
            )
        }
        else {
            let badgesArray = allUserData.badges_earned;
            let badgeDataArray = Object.keys(badgesArray);

            let allBadges = badgeDataArray.map((item, key) => {
                let badgeName = item.replace(/[_-]/g, " ");
                let badgeImage = Badges.badgeInfo[item].img;
                return (
                    <li className="badge-container" key={key} onClick={() => this.badgeModal(key, item, badgeName, badgeImage)}>
                        <div className="badge-img" style={{ backgroundImage: `url(${badgeImage})` }} />
                        <h3>{badgeName}</h3>
                    </li>
                )
            })
            return (
                <div>
                    <ul className="badgeTiles">
                        { allBadges }
                    </ul>
                    <BadgeModal
                        isOpen={this.state.openDeleteModal}  
                        itemId={this.state.activeItemId}
                        itemDesc={this.state.activeItemDesc}
                        itemName={this.state.activeItemName}
                        itemImage={this.state.activeItemImage}
                        closeModalBox={ () => this.toggleModal()}
                    />
                </div>
            )
        }
        
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