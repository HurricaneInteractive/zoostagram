import React, { Component } from 'react'
import firebase from 'firebase'

import PageTitle from './PageTitle'
import Loading from './Loading'

import Prizes from '../config/prizes'

const Prize = (props) => {
    let { name, theme, thumbnail, id, active, buyable } = props;
    
    if (!buyable) return false;

    return (
        <div className={`prize ${ active ? 'active' : '' }`} onClick={ props.selectPrize(id) }>
            <div className="prize-thumbnail" style={{ backgroundImage: `url(${ Prizes.prizes[thumbnail].image })` }} />
            <h4 style={{ color: theme }}>{name}</h4>
        </div>
    )
}

export default class Claim extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.authUser,
            userData: null,
            prizes: null,
            selectedKey: '',
            claimDialogueOpen: false,
            password: '',
            error: false,
            lowestPoint: 0
        }

        this.validPassword = '0000';

        this.onChange = this.onChange.bind(this)
        this.selectPrize = this.selectPrize.bind(this)
        this.toggleClaimDialogue = this.toggleClaimDialogue.bind(this)
        this.claimPrize = this.claimPrize.bind(this)
    }

    componentDidMount() {
        const _this = this;
        let curLow = 10000000;
        
        firebase.database().ref('prizes').once('value', (snap) => {
            _this.setState({
                prizes: snap.val()
            }, () => {
                let lowest = Object.keys(_this.state.prizes).map((prize) => {
                    if (_this.state.prizes[prize].price <= curLow) {
                        curLow = _this.state.prizes[prize].price
                    }

                    return curLow;
                })
                
                _this.setState({
                    lowestPoint: lowest[lowest.length - 1]
                })
            })
        })

        firebase.database().ref(`users/${this.state.user.uid}`).once('value', (snap) => {
            _this.setState({
                userData: snap.val()
            })
        })
    }

    onChange = () => (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    selectPrize = (key) => (e) => {
        e.preventDefault()
        this.setState({
            selectedKey: key
        })
    }

    toggleClaimDialogue = () => (e) => {
        e.preventDefault();
        this.setState({
            claimDialogueOpen: !this.state.claimDialogueOpen
        })
    }

    claimPrize = () => (e) => {
        e.preventDefault();
        const { user, password, userData, prizes, selectedKey } = this.state;
        const _this = this;
        
        if (password === '' || password !== this.validPassword) {
            this.setState({
                error: true
            })
            return false;
        }

        let points = userData.points,
            removePoints = prizes[selectedKey].price,
            newUserData = {...userData};

        newUserData.points = points - removePoints;

        firebase.database().ref(`users/${user.uid}`).update({
            points: (points - removePoints)
        })
        .then(() => {
            _this.setState({
                userData: newUserData,
                error: false,
                claimDialogueOpen: false,
                selectedKey: '',
                password: ''
            })
        })
    }

    render() {
        let { prizes, selectedKey, user, userData, claimDialogueOpen, password, error, lowestPoint } = this.state;
        return (
            <div className="profile-page claim-page">
                <PageTitle title="Claim Points" back={ () => this.props.routerProps.history.goBack() } />
                <div className="user-info">
                    <h3>{ user.displayName }</h3>
                    <p>Points: { userData ? userData.points : '-' }</p>
                </div>
                { prizes === null ? <Loading /> : '' }
                <div className={`prizes-container ${ prizes !== null ? 'fadeIn' : '' }`}>
                    {
                        prizes !== null && userData !== null ? (
                            userData.points < lowestPoint ? (
                                <h2 className="no-results">You need some more points</h2>
                            ) : (
                                Object.keys(prizes).map(key => (
                                    <Prize 
                                        key={key} 
                                        id={key} 
                                        name={prizes[key].name} 
                                        theme={prizes[key].theme} 
                                        thumbnail={prizes[key].image}
                                        selectPrize={(id) => this.selectPrize(id)}
                                        active={ selectedKey === key ? true : false }
                                        buyable={ userData.points < prizes[key].price ? false : true }
                                    />
                                ))
                            )
                        ) : ''
                    }
                </div>
                { selectedKey !== '' ? <div className="controls"><a className="btn" onClick={ this.toggleClaimDialogue() }>Claim</a></div> : '' }
                {
                    claimDialogueOpen ? (
                        <div className="popup-dialogue">
                            <div className="dialogue-inner">
                                <p>Present your device to a staff member to claim your price.</p>
                                <div className={`input-wrapper ${ error ? 'error' : '' }`}>
                                    <input name="password" type="password" id="password" value={password} placeholder="Password" autoFocus onChange={ this.onChange() } />
                                </div>

                                <a className="btn" onClick={ this.claimPrize() }>Submit</a>
                                <a className="btn btn-outline" onClick={ this.toggleClaimDialogue() }>Cancel</a>
                            </div>
                        </div>
                    ) : ''
                }
            </div>
        )
    }
}