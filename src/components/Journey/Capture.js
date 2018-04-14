/**
 * Placeholder Capture Component
 * 
 * Currently being used by AJ to test image capturing
 */

import React, { Component } from 'react'

class Capture extends Component {
    constructor() {
        super()
        this.state = {
            stream: null
        }
    }

    componentWillUnmount() {
        this.state.stream.getTracks()[0].stop();
    }

    componentDidMount() {
        const mediaConstraints = {
            audio: false,
            video: {
                facingMode: "user"
            }
        }

        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((mediaStream) => {
                let video = document.getElementById('main-camera')
                video.srcObject = mediaStream;
                video.onloadedmetadata = function(e) {
                    video.play();
                }
                this.setState({
                    stream: mediaStream
                })
            })
            .catch((err) => {
                console.log(err.name + ": " + err.message);
            })
    }

    render() {
        return (
            <div className="camera-feed">
                <video id="main-camera" />
                <canvas id="image-copy" />
                <div className="camera-controls">
                    <a className="take-photo">Take Photo</a>
                </div>
            </div>
        )
    }
}

export default Capture