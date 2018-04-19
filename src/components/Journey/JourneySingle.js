import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Masonry from 'react-masonry-component'
import firebase from '../firebase'

import PageTitle from '../Global/PageTitle'
import Loading from '../Global/Loading'

const masonryOptions = {
    transitionDuration: 0
};

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
                journey: snap.val(),
                fetching: false
            })
        })
    }

    /**
     * Fetches all the images for a Journey from the Cloud Storage
     * 
     * @memberof JourneySingle
     * @deprecated
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
        let images = this.state.journey.images;
        if (images !== null && typeof images !== 'undefined') {
            let imageDOM = Object.keys(images).map((key) => {
                return (
                    <div className="single-image" key={key}>
                        <img src={images[key].image_url} alt="Zoo" />
                    </div>
                )
            })

            return imageDOM;
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
                                {
                                    journey.images === null || typeof journey.images === 'undefined' ? (
                                        <h2 className="no-results">Capture the moment</h2>
                                    ) : (
                                        <Masonry
                                            className={'journey-listing'} // default ''
                                            elementType={'ul'} // default 'div'
                                            options={masonryOptions}
                                            disableImagesLoaded={false} // default false
                                            updateOnEachImageLoad={true}
                                        >
                                            { this.generateImageGallery() }
                                        </Masonry>
                                    )
                                }
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