import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import PageTitle from '../Global/PageTitle'
import Loading from '../Global/Loading'

/**
 * Journey Page Component - Displays the all users journeys
 * 
 * @export
 * @class Journey
 * @extends {Component}
 */
export default class Journey extends Component {
    /**
     * Creates an instance of Journey.
     * 
     * @memberof Journey
     */
    constructor(props) {
        super(props)
        this.state = {
            journeys: null,
            creatingNew: false,
            journeyName: '',
            user: this.props.authUser,
            fetching: true,
            error: false
        }

        this.onChange = this.onChange.bind(this)
        this.toggleCreateState = this.toggleCreateState.bind(this)
        this.createNewJourney = this.createNewJourney.bind(this)
        this.fetchJourneyData = this.fetchJourneyData.bind(this)
        this.generateJourneyData = this.generateJourneyData.bind(this)
    }

    /**
     * React function - See React Lifecycle
     * Gets the current User and fetches the data
     * 
     * @memberof Journey
     */
    componentWillMount() {
        this.fetchJourneyData()
    }

    /**
     * Fetches the Journey data from Firebase based on the User UID
     * 
     * @memberof Journey
     */
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

    /**
     * Handles Form on change function
     * 
     * @param {object} e Event Object
     * @memberof Journey
     */
    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    /**
     * Toggles the Create popup dialogue
     * 
     * @param {object} e Anchor Event Object
     * @memberof Journey
     */
    toggleCreateState(e) {
        e.preventDefault();
        this.setState({
            creatingNew: !this.state.creatingNew
        })
    }

    /**
     * Creates a new Journey in the DB & refetches the content
     * 
     * @param {any} e Anchor Event Object
     * @returns Firebase Response
     * @memberof Journey
     */
    createNewJourney(e) {
        e.preventDefault();
        const _this = this;
        let { journeyName, user } = this.state;

        if (journeyName === '') {
            this.setState({
                error: true
            })
            return false;
        }

        this.setState({
            error: false
        })

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

    /**
     * Generates the Journey Tiles
     * 
     * @returns DOM
     * @memberof Journey
     */
    generateJourneyData() {
        let journeys = this.state.journeys;

        let journeyData = Object.keys(journeys).map((key) => {

            let url = null;

            if (journeys[key].images !== null && typeof journeys[key].images !== 'undefined') {
                let images = journeys[key].images;
                url = images[Object.keys(images)[0]].image_url;
            }

            return (
                <div key={key} className="journey-single">
                    <Link to={`/journey/view/${journeys[key].id}`}>
                        <div className="thumbnail" style={{
                            backgroundImage: url !== null ? ( `url(${url})` ) : ('')
                        }} />
                        <p>{journeys[key].journey_name}</p>
                    </Link>
                </div>
            )
        })

        return journeyData;
    }

    /**
     * React Function - Renders the Component Markup
     * 
     * @returns DOM
     * @memberof Journey
     */
    render() {
        return (
            <div className="journey-page">
                <PageTitle title="Journey" back={() => this.props.routerProps.history.goBack()} />
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
                        <div className="journey-dialogue">
                            <div className="dialogue-inner">
                                <div className={`input-wrapper ${ this.state.error ? 'error' : '' }`}>
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