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

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'
import CryptoJS from 'crypto-js'

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
    constructor() {
        super()
        this.state = {
            stream: null,
            initialising: true,
            user: null,
            facingMode: "environment"
        }

        this.width = 1280;
        this.height = 0;
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
    }

    /**
     * React Function - See React Lifecycle
     * 
     * @memberof Capture
     */
    componentDidMount() {
        this.setState({
            user: firebase.auth().currentUser
        })
        this.initialiseStream();
    }

    /**
     * Starts the stream and projects it on a video element
     * 
     * @memberof Capture
     */
    initialiseStream() {
        const _this = this;

        // Gets all the component elements
        this.video = document.getElementById('main-camera');
        this.canvas = document.getElementById('image-copy');
        // this.photo = document.getElementById('photo-preview');

        // Contraints for the camera
        const mediaConstraints = {
            audio: false,
            video: {
                facingMode: _this.state.facingMode
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

                // This must be initiate by a user :(
                // let requestFullScreen = this.video.requestFullscreen || this.video.msRequestFullscreen || this.video.mozRequestFullScreen || this.video.webkitRequestFullscreen;
                // requestFullScreen.call(this.video);
                
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
                _this.height = _this.video.videoHeight / (_this.video.videoWidth / _this.width);

                if (isNaN(_this.height)) {
                    _this.height = _this.width / (4 / 3);
                }

                _this.video.setAttribute('width', _this.width);
                _this.video.setAttribute('height', _this.height);
                _this.canvas.setAttribute('width', _this.width);
                _this.canvas.setAttribute('height', _this.height);
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

        // let data = this.canvas.toDataURL(mimetype);
        // this.photo.setAttribute('src', data);

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
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            context.drawImage(this.video, 0, 0, this.width, this.height);

            // let data = this.canvas.toDataURL(mimetype);
            // this.photo.setAttribute('src', data);

            // Converts the canvas to a Image Blob to save into Firebase Storage
            this.canvas.toBlob(function(blob) {
                _this.saveBlob(blob)
                _this.savePhoto();
            }, mimetype);
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
    savePhoto() {
        let file = this.photo_blob;
        let metadata = {
            contentType: mimetype,
            customMetadata: {
                'enclosure': 'lion'
            }
        }

        let name = CryptoJS.SHA256(String(new Date())).words.join('') + '.jpg';
        let folder = this.state.user.uid;

        let referencePath = `journey/${folder}/${name}`;

        let uploadTask = storageRef.child(referencePath).put(file, metadata);
        console.log(uploadTask);

        // uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
        //     // Processing
        //     let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //     console.log('Upload is ' + progress + '% done');
        //     switch (snapshot.state) {
        //         case firebase.storage.TaskState.PAUSED:
        //             console.log('Upload is paused');
        //             break;
        //         case firebase.storage.TaskState.RUNNING:
        //             console.log('Upload is running');
        //             break;
        //         default:
        //             console.log('Stupid eslint');
        //     }
        // }, (err) => {
        //     // Error
        //     alert(err);
        //     console.error(err)
        // }, () => {
        //     // Success
        //     let downloadURL = uploadTask.snapshot.downloadURL;
        //     console.log('Completed', downloadURL);
        // })
    }

    clearStreams() {
        this.state.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    flipCameraFacingMode(e) {
        e.preventDefault();
        let mode = this.state.facingMode === "user" ? "environment" : "user";
        console.log('New mode', mode);

        this.setState({
            facingMode: mode
        })

        this.initialiseStream();
    }

    /**
     * React Render function
     * 
     * @returns DOM
     * @memberof Capture
     */
    render() {
        return (
            <div className="camera-feed">
                { this.state.initialising === true ? <Loading fullscreen={true} /> : '' }
                <video id="main-camera" />
                <canvas id="image-copy" />
                <div className="camera-controls">
                    <Link id="stop-capturing" to="/">Stop</Link>
                    <a id="camera-flip" onClick={ (e) => this.flipCameraFacingMode(e) }>Flip View</a>
                    <div className="capture-bar">
                        <a className="take-photo" onClick={ (e) => this.takePhoto(e) }>Take Photo</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default Capture