import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from '../Global/PageTitle'
import Loading from '../Global/Loading'

export default class Journey extends Component {
    constructor() {
        super()
        this.state = {
            journeys: null,
            creatingNew: false,
            journeyName: '',
            user: null,
            fetching: true
        }

        this.onChange = this.onChange.bind(this)
        this.toggleCreateState = this.toggleCreateState.bind(this)
        this.createNewJourney = this.createNewJourney.bind(this)
        this.fetchJourneyData = this.fetchJourneyData.bind(this)
        this.generateJourneyData = this.generateJourneyData.bind(this)
    }

    componentWillMount() {
        this.setState({
            user: firebase.auth().currentUser
        }, () => {
            this.fetchJourneyData()
        })
    }

    fetchJourneyData() {
        const _this = this;
        let user = this.state.user.uid, 
            ref = firebase.database().ref(`journeys/${user}`).orderByChild('timestamp'),
            journeys = [];
        
        ref.once('value', (snap) => {
            if (snap.val() !== null) {
                snap.forEach((ss) => {
                    journeys.push(ss.val());
                });
    
                _this.setState({
                    journeys: journeys.reverse(),
                    fetching: false
                })
            } else {
                _this.setState({
                    fetching: false
                })
            }
        })
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    toggleCreateState(e) {
        e.preventDefault();
        this.setState({
            creatingNew: !this.state.creatingNew
        })
    }

    createNewJourney(e) {
        e.preventDefault();
        const _this = this;
        let { journeyName, user } = this.state;

        if (journeyName === '') {
            return false;
        }

        var newJourneyKey = firebase.database().ref().child(`journeys/${user.uid}/`).push().key;

        var journeyData = {
            journey_name: journeyName,
            id: newJourneyKey,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }

        var updates = {};
        updates['/journeys/' + user.uid + '/' + newJourneyKey] = journeyData

        return firebase.database().ref().update(updates)
            .then(() => {
                _this.setState({
                    journeyName: '',
                    creatingNew: false,
                    fetching: true
                }, () => {
                    _this.fetchJourneyData();
                })
            })
            .catch((err) => {
                console.error('Update Error', err.message)
            })
    }

    generateJourneyData() {
        let journeys = this.state.journeys;

        let journeyData = Object.keys(journeys).map((key) => {
            return (
                <div key={key} className="journey-single">
                    <div className="thumbnail" />
                    <Link to={`/journey/${journeys[key].id}`}>{journeys[key].journey_name}</Link>
                </div>
            )
        })

        return journeyData;
    }

    render() {
        return (
            <div className="page all-journeys">
                <PageTitle title="Journey" back={() => this.props.history.goBack()} />
                <a className="create-journey" onClick={(e) => this.toggleCreateState(e)}>Create New</a>
                <div className="journeys-wrapper">
                    {
                        this.state.fetching === true ? ( <Loading /> ) : (
                            <div className="journey-listing">
                                { 
                                    this.state.journeys !== null ? (
                                        this.generateJourneyData()
                                    ) : (
                                        <h2 className="no-results">Time to create some memories</h2>
                                    ) 
                                }
                            </div>
                        )
                    }
                </div>
                {
                    this.state.creatingNew ? (
                        <div className="new-journey-dialogue">
                            <div className="dialogue-inner">
                                <div className="input-wrapper">
                                    <input placeholder="Journey Name" value={this.state.journeyName} name="journeyName" id="journeyName" onChange={(e) => this.onChange(e)} />
                                </div>
                                <button className="btn" onClick={(e) => this.createNewJourney(e)}>Create</button>
                                <button className="btn btn-outline" onClick={(e) => this.toggleCreateState(e)}>Cancel</button>
                            </div>
                        </div>
                    ) : ('')
                }
            </div>
        )
    }
}