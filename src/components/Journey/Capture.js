/**
 * Placeholder Capture Component
 * 
 * Currently being used by AJ to test image capturing
 * 
 * TODO: Include proper user flow & UI
 * TODO: Camera Flip Functionality
 * 
 * User Flow
 * - Camera with live feed to take the image
 * - Once captured
 * -- Show the image with UI to Save & tag the enclosure
 * -- Also close button to delete that image and take a new photo
 */

import React, { Component, Fragment } from 'react'
// import { Link } from 'react-router-dom'
import firebase from '../firebase'
import CryptoJS from 'crypto-js'

import Enclosures from '../config/enclosures';

import Loading from '../Global/Loading'

const mimetype = 'image/jpeg'

const storageRef = firebase.storage().ref();

/**
 * Component which handles the capturing & saving of a Journey Image
 * 
 * @class Capture
 * @extends {Component}
 */
class Capture extends Component {
    /**
     * Creates an instance of Capture.
     * Sets up initial variables for this Component & bind events
     * 
     * @memberof Capture
     */
    constructor(props) {
        super(props)
        this.state = {
            stream: null,
            initialising: true,
            user: this.props.authUser,
            facingMode: "user",
            fullscreen: false,
            reviewingPhoto: false,
            savingPhoto: false,
            selectedEnclosure: '',
            enclosureSelectOpen: false,
            enclosureError: false
        }

        this.width = 0;
        this.height = 960;
        this.streaming = false;
        this.video = null;
        this.canvas = null;
        this.photo = null;
        this.photo_blob = null;

        // Bind Events
        this.initialiseStream = this.initialiseStream.bind(this);
        this.takePhoto = this.takePhoto.bind(this);
        this.clearPhoto = this.clearPhoto.bind(this);
        this.saveBlob = this.saveBlob.bind(this);
        this.savePhoto = this.savePhoto.bind(this);
        this.flipCameraFacingMode = this.flipCameraFacingMode.bind(this);
        this.clearStreams = this.clearStreams.bind(this)
        this.goFullscreen = this.goFullscreen.bind(this)
        this.stopImageReview = this.stopImageReview.bind(this)
        this.renderEnclosureSelect = this.renderEnclosureSelect.bind(this)
        this.toggleEnclosureSelect = this.toggleEnclosureSelect.bind(this)
        this.selectEnclosure = this.selectEnclosure.bind(this)
    }

    /**
     * React Function - See React Lifecycle
     * Removes the image & stops the site from accessing the camera
     * 
     * @memberof Capture
     */
    componentWillUnmount() {
        this.clearPhoto();
        this.clearStreams();
    }

    /**
     * Sets the width to the width of the window
     * 
     * @memberof Capture
     */
    componentWillMount() {
        this.width = window.innerWidth
        this.height = window.innerHeight
    }

    /**
     * React Function - See React Lifecycle
     * 
     * @memberof Capture
     */
    componentDidMount() {
        this.initialiseStream();
    }

    /**
     * Starts the stream and projects it on a video element
     * 
     * @memberof Capture
     */
    initialiseStream() {
        const _this = this;

        if (this.state.stream !== null) {
            this.clearStreams();
        }

        // Gets all the component elements
        this.video = document.getElementById('main-camera');
        this.canvas = document.getElementById('image-copy');
        // this.photo = document.getElementById('photo-preview');

        // Contraints for the camera
        let mediaConstraints = {
            audio: false,
            video: {
                facingMode: _this.state.facingMode,
                focusMode: "continuous"
            }
        }

        // Starts the stream and displays the output to the user
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((mediaStream) => {
                let video = document.getElementById('main-camera')
                video.srcObject = mediaStream;
                video.onloadedmetadata = function(e) {
                    video.play();
                }
                
                _this.setState({
                    stream: mediaStream
                })
            })
            .catch((err) => {
                alert(err.name + ": " + err.message);
                console.log(err.name + ": " + err.message);
            })
        
        // Sets the height and width of the video & canvas elements when the stream starts
        this.video.addEventListener('canplay', (e) => {
            if (!_this.streaming) {

                _this.height = window.innerHeight;
                _this.width = _this.video.videoWidth / (_this.video.videoHeight / _this.height);

                _this.video.setAttribute('width', _this.width);
                _this.video.setAttribute('height', _this.height);

                _this.canvas.setAttribute('width', window.innerWidth);
                _this.canvas.setAttribute('height', window.innerHeight);
                _this.streaming = true;
                
                _this.setState({
                    initialising: false
                })
            }
        }, false)

        // Ensures that the canvas doesn't have anything on it
        this.clearPhoto();
    }

    /**
     * Clears the canvas and preview image tag
     * 
     * @memberof Capture
     */
    clearPhoto() {
        let context = this.canvas.getContext('2d');
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.photo_blob = null;
    }

    /**
     * Captures the current video frame,
     * projects it on a canvas & sets the preview
     * Calls Save function
     * 
     * @param {any} e Click event Object
     * @memberof Capture
     * 
     * TODO: Display the preview before saving the image
     */
    takePhoto(e) {
        const _this = this;
        let context = this.canvas.getContext('2d');

        if (this.width && this.height) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // this.canvas.width = this.width;
            // this.canvas.height = this.height;

            let canvasX = Math.round((this.width - this.canvas.width) / 2) * -1;

            if (this.state.facingMode === "user") {
                context.translate(this.canvas.width, 0);
                context.scale(-1, 1);
            }

            //ctx.drawImage(image, dx, dy, dWidth, dHeight);
            context.drawImage(this.video, canvasX, 0, this.width, this.height);
            
            // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            // context.drawImage(this.video, 0, 0, 257, 667, 0, 0, 375, 667);

            // Converts the canvas to a Image Blob to save into Firebase Storage
            this.canvas.toBlob(function(blob) {
                _this.saveBlob(blob)
                // _this.savePhoto();
            }, mimetype);

            this.setState({
                reviewingPhoto: true
            })
        }
        else {
            this.clearPhoto();
        }

        e.preventDefault();
    }

    /**
     * Save the image on the canvas to a Class variable
     * 
     * @param {blob} blob Capture Image Blob
     * @memberof Capture
     */
    saveBlob(blob) {
        this.photo_blob = blob;
    }

    /**
     * Saves the image into the Firebase Storage
     * 
     * @memberof Capture
     * 
     * TODO: Update the storage path to save into a specific folder per user & journey ID
     * TODO: Display the Process to the user
     * TODO: Save with the enclosure that the user picks
     */
    savePhoto(e = null) {

        const _this = this;
        let journeyID = this.props.routerProps.match.params.id;

        if (e !== null) {
            e.preventDefault();
        }

        if (this.state.selectedEnclosure === '') {
            this.setState({
                enclosureError: true
            })
            return false;
        }

        let file = this.photo_blob;
        let metadata = {
            contentType: mimetype,
            customMetadata: {
                'enclosure': _this.state.selectedEnclosure
            }
        }

        let name = CryptoJS.SHA256(String(new Date())).words.join('') + '.jpg';
        let folder = this.state.user.uid;

        let referencePath = `journey/${folder}/${journeyID}/${name}`;

        let uploadTask = storageRef.child(referencePath).put(file, metadata);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
            // In Progress
            _this.setState({
                savingPhoto: true
            })
        }, (err) => {
            // Error
            alert(err);
            console.error(err)
        }, () => {
            // Success
            let journeyRef = firebase.database().ref(`journeys/${_this.state.user.uid}/${journeyID}/images`);
            let newKey = journeyRef.push();
            newKey.set({
                image_name: name
            })
            .then(() => {
                _this.setState({
                    reviewingPhoto: false,
                    savingPhoto: false,
                    selectedEnclosure: '',
                    enclosureSelectOpenfalse: false,
                    enclosureError: false
                })
            })
            .catch((err) => {
                console.error(err.message);
            })
            
        })
    }

    /**
     * Stops all the current streaming Tracks
     * 
     * @memberof Capture
     */
    clearStreams() {
        this.streaming = false;
        this.state.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    /**
     * Flips the camera view to either take an `environment` or a `user` shot
     * 
     * @param {object} e Anchor event object
     * @memberof Capture
     */
    flipCameraFacingMode(e) {
        e.preventDefault();
        let mode = this.state.facingMode === "user" ? "environment" : "user";

        this.setState({
            facingMode: mode
        }, () => {
            this.initialiseStream();
        })
    }

    goFullscreen(e) {
        e.preventDefault()
        let elem = document.body;
        
        switch(this.state.fullscreen) {
            case true:
                let exitFullScreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                exitFullScreen.call(document);

                this.setState({
                    fullscreen: false
                }, () => {
                    this.initialiseStream();
                })
                break;

            default:
                let requestFullScreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
                requestFullScreen.call(elem);

                this.setState({
                    fullscreen: true
                }, () => {
                    this.initialiseStream();
                })
                break;
        }
    }

    stopImageReview(e) {
        e.preventDefault();

        this.setState({
            reviewingPhoto: false
        }, () => {
            this.clearPhoto()
        })
    }

    toggleEnclosureSelect(e) {
        e.preventDefault();
        this.setState({
            enclosureSelectOpen: !this.state.enclosureSelectOpen
        })
    }

    selectEnclosure(enclosure) {
        this.setState({
            selectedEnclosure: enclosure,
            enclosureError: false
        })
    }

    renderEnclosureSelect() {
        let enclosurses = Enclosures.enclosures;

        let selectOptions = enclosurses.map((enclosure) => (
            <li 
                key={enclosure} 
                onClick={ () => this.selectEnclosure(enclosure) }
                className={`${this.state.selectedEnclosure === enclosure ? 'active' : ''}`}
            >{enclosure}</li>
        ))

        return (
            <div className={`enclosure-select ${this.state.enclosureSelectOpen ? 'open' : ''} ${this.state.enclosureError ? 'error' : ''}`}>
                <ul className="enclosures">
                    { selectOptions }
                </ul>
                <a className="enclosure-trigger" onClick={ (e) => this.toggleEnclosureSelect(e) }>
                    { this.state.selectedEnclosure !== '' ? this.state.selectedEnclosure : 'Select Enclosure' }
                </a>
            </div>
        )
    }

    /**
     * React Render function
     * 
     * @returns DOM
     * @memberof Capture
     */
    render() {
        return (
            <div className={`camera-feed ${ this.state.reviewingPhoto ? 'review-image' : '' } ${ this.state.savingPhoto ? 'saving' : '' }`}>
                { this.state.initialising === true ? <Loading fullscreen={true} /> : '' }
                <video id="main-camera" className={`${this.state.facingMode}`} />
                <canvas id="image-copy" className={`${this.state.facingMode}`} />
                <div className="camera-controls">
                    <div className="user-controls-bar">
                        {
                            this.state.reviewingPhoto ? (
                                <a id="stop-capturing" onClick={ (e) => this.stopImageReview(e) }>Return to camera</a>
                            ) : (
                                <Fragment>
                                    <a id="camera-flip" onClick={ (e) => this.flipCameraFacingMode(e) }>Flip View</a>
                                    <a id="stop-capturing" onClick={ () => this.props.routerProps.history.goBack() }>Stop</a>
                                </Fragment>
                            )
                        }
                        <a id="fullscreen" className={`${this.state.fullscreen ? 'exit' : ''}`} onClick={ (e) => this.goFullscreen(e) }>Fullscreen</a>
                    </div>
                    <div className="capture-bar">
                        {
                            this.state.reviewingPhoto ? (
                                <Fragment>
                                    { this.renderEnclosureSelect() }
                                    <a className="save-photo" onClick={ (e) => this.savePhoto(e) }><span className="save-icon">Save</span></a>
                                </Fragment>
                            ) : (
                                <a className="take-photo" onClick={ (e) => this.takePhoto(e) }>Take Photo</a>
                            )
                        }
                    </div>
                </div>
                {
                    this.state.savingPhoto ? (
                        <Loading fullscreen={true} />
                    ) : ('')
                }
            </div>
        )
    }
}

export default Capture