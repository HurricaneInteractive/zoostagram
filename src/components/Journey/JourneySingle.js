import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import Masonry from 'react-masonry-component'
import firebase from '../firebase'

import PageTitle from '../Global/PageTitle'
import Loading from '../Global/Loading'

import JourneyTitle from './elements/JourneyTitle'
import JourneyImage from './elements/JourneyImage'

const masonryOptions = {
    transitionDuration: 200
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
        this.updateStateWithNewTitle = this.updateStateWithNewTitle.bind(this)
        this.updateFakeImageState = this.updateFakeImageState.bind(this)
        this.afterImageDelete = this.afterImageDelete.bind(this)
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

        this.setState({
            fetching: true
        })

        ref.once('value', (snap) => {
            _this.setState({
                journey: snap.val(),
                fetching: false
            })
        })
    }

    /**
     * Refetches data after deleting image
     * 
     * @memberof JourneySingle
     */
    afterImageDelete() {
        this.fetchJourneyData();
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
     * Updates the state to reflect the new Enclosure value
     * 
     * @param {string} id ID of the image
     * @param {string} newEnclosure Text of the new enclosure
     * @memberof JourneySingle
     */
    updateFakeImageState(id, newEnclosure) {
        let newJourney = {...this.state.journey};
        newJourney.images[id].enclosure = newEnclosure;

        this.setState({
            journey: newJourney
        })
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
                let imageRef = firebase.storage().ref(`journey/${this.state.user.uid}/${this.state.journey.id}/${images[key].image_name}`);
                let imageDBRef = firebase.database().ref(`journeys/${this.state.user.uid}/${this.state.journey.id}/images/${key}`);
                return (
                    <JourneyImage 
                        key={key} 
                        id={key} 
                        imageData={images[key]} 
                        storageRef={imageRef} 
                        DBRef={imageDBRef}
                        updateFakeState={ (id, enclosure) => this.updateFakeImageState(id, enclosure) }
                        afterImageDelete={() => this.afterImageDelete()}
                    />
                )
            })

            return imageDOM;
        }
    }

    /**
     * Updates the state to reflect the new Journey Title
     * 
     * @param {string} title New Title
     * @memberof JourneySingle
     */
    updateStateWithNewTitle(title) {
        let newJourney = {...this.state.journey};
        newJourney.journey_name = title;
        
        this.setState({
            journey: newJourney
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
        let journey_id = this.props.routerProps.match.params.id;
        let totalImages = 0;

        if (journey !== null) {
            totalImages = typeof journey.images === 'undefined' ? 0 : Object.keys(journey.images).length;
        }

        return (
            <div className="journey-page journey-single">
                <PageTitle title="Journey" back={() => this.props.routerProps.history.goBack()} />
                {
                    fetching === true ? ( <Loading /> ) : (
                        journey === null ? (
                            <h2 className="no-results">Capture the moment</h2>
                        ) : (
                            <div className="single-wrapper">
                                <JourneyTitle
                                    title={journey.journey_name}
                                    id={journey.id}
                                    uid={this.state.user.uid}
                                    updateFakeState={ (title) => this.updateStateWithNewTitle(title) }
                                    totalImages={totalImages}
                                />
                                {
                                    journey.images === null || typeof journey.images === 'undefined' ? (
                                        <h2 className="no-results">Capture the moment</h2>
                                    ) : (
                                        <Masonry
                                            className={'journey-listing'}
                                            elementType={'ul'}
                                            options={masonryOptions}
                                            disableImagesLoaded={false}
                                            updateOnEachImageLoad={true}
                                        >
                                            <Fragment>
                                                {
                                                    typeof journey.generatedMapURL !== 'undefined' ? (
                                                        <div className="single-image">
                                                            <img src={journey.generatedMapURL} alt="generate map" />
                                                        </div>
                                                    ) : ('')
                                                }
                                                { this.generateImageGallery() }
                                            </Fragment>
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