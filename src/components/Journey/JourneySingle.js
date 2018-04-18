import React, { Component } from 'react'
import firebase from '../firebase'

import PageTitle from '../Global/PageTitle'
import Loading from '../Global/Loading'

/**
 * JourneySingle Component - Renders the Journey images
 * 
 * @export
 * @class JourneySingle
 * @extends {Component}
 */
export default class JourneySingle extends Component {
    /**
     * Creates an instance of JourneySingle.
     * 
     * @param {any} props 
     * @memberof JourneySingle
     */
    constructor(props) {
        super(props)
        this.state = {
            journey: null,
            fetching: true,
            user: this.props.authUser
        }

        this.fetchJourneyData = this.fetchJourneyData.bind(this);
    }

    /**
     * React Function - See React Lifecycle
     * Fetches the journey data
     * 
     * @memberof JourneySingle
     */
    componentDidMount() {
        this.fetchJourneyData();
    }

    /**
     * Uses URL :id to fetch the Journey information
     * 
     * @memberof JourneySingle
     */
    fetchJourneyData() {
        const _this = this;
        let id = this.props.routerProps.match.params.id;
        let ref = firebase.database().ref(`journeys/${this.state.user.uid}/${id}`)

        ref.once('value', (snap) => {
            _this.setState({
                journey: snap.val(),
                fetching: false
            })
        })
    }

    /**
     * React Function - See Documentation
     * Renders the Journey Markup
     * 
     * @returns DOM
     * @memberof JourneySingle
     */
    render() {
        let { journey, fetching } = this.state;

        return (
            <div className="journey-page journey-single">
                <PageTitle title="Journey" back={() => this.props.routerProps.history.goBack()} />
                {
                    fetching === true ? ( <Loading /> ) : (
                        journey === null ? (
                            <h2 className="no-results">Capture the moment</h2>
                        ) : (
                            <div className="single-wrapper">
                                <h3>{journey.journey_name}</h3>
                            </div>
                        )
                    )
                }
            </div>
        )
    }
}