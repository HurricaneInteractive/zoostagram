import React, { Component } from 'react'
import { Link } from 'react-router-dom'
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
            journeyImages: [],
            fetching: true,
            user: this.props.authUser
        }

        this.id = this.props.routerProps.match.params.id;

        this.fetchJourneyData = this.fetchJourneyData.bind(this)
        this.fetchJourneyImages = this.fetchJourneyImages.bind(this)
        this.generateImageGallery = this.generateImageGallery.bind(this)
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
        let id = this.id;
        let ref = firebase.database().ref(`journeys/${this.state.user.uid}/${id}`)

        ref.once('value', (snap) => {
            _this.setState({
                journey: snap.val()
            }, () => {
                _this.fetchJourneyImages()
            })
        })
    }

    /**
     * Fetches all the images for a Journey from the Cloud Storage
     * 
     * @memberof JourneySingle
     */
    fetchJourneyImages() {
        const _this = this;
        const images = this.state.journey.images;

        if (images !== null && typeof images !== 'undefined') {
            Object.keys(images).map((key) => {
                let storageRef = firebase.storage().ref(`journey/${this.state.user.uid}/${this.id}/${images[key].image_name}`);
                return storageRef.getDownloadURL().then((url) => {
                    
                    let newImages = _this.state.journeyImages;
                    newImages.push(url);
                    
                    _this.setState({
                        journeyImages: newImages,
                        fetching: false
                    })
                });
            })
        } else {
            this.setState({
                fetching: false
            })
        }
    }

    /**
     * Loops through images and displays them to the user
     * 
     * @returns DOM
     * @memberof JourneySingle
     */
    generateImageGallery() {
        if (this.state.journey !== null) {
            if (this.state.journeyImages.length !== 0) {
                let images = this.state.journeyImages.map((url, i) => {
                    return (
                        <div className="single-image" key={i}>
                            <img src={url} alt="Zoo" />
                        </div>
                    )
                })

                return images;
            } 
            else {
                return <h2 className="no-results">Capture the moment</h2>
            }
        } 
        else {
            return <Loading />
        }
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
        let journey_id = this.props.routerProps.match.params.id;

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
                                <div className="journey-listing">
                                    { this.generateImageGallery() }
                                </div>
                            </div>
                        )
                    )
                }
                <div className="capture-bar">
                    <Link className="capture-icon" to={`/journey/capture/${journey_id}`}>Take Photo</Link>
                </div>
            </div>
        )
    }
}