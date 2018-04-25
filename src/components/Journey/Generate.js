import React, { Component, Fragment } from 'react'
import firebase from '../firebase'
import Loading from '../Global/Loading'

import PageTitle from '../Global/PageTitle'
import Enclosures from '../config/enclosures'

import map from '../../images/zoo_map.jpg'
const mapWidth = 500;
const mapHeight = 500;
const mimetype = 'image/jpeg'

export default class Generate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            id: this.props.routerProps.match.params.id,
            journey: null,
            mapGenerated: false,
            uploading: false
        }

        this.canvas = null;

        this.startGeneration = this.startGeneration.bind(this)
        this.saveCanvasImage = this.saveCanvasImage.bind(this)
    }

    componentDidMount() {
        const _this = this;
        
        firebase.database().ref(`journeys/${this.state.user.uid}/${this.state.id}`)
            .once('value', (snap) => {
                _this.setState({
                    journey: snap.val()
                })
            })
            .catch((err) => {
                console.error(err.message);
            })
    }

    startGeneration(e) {
        e.preventDefault();
        let { journey } = this.state;
        let { coordinates } = Enclosures;
        let mapImage = new Image();

        mapImage.onload = () => {
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('width', mapWidth);
            this.canvas.setAttribute('height', mapHeight);

            let ctx = this.canvas.getContext('2d');

            let allEnclosures = Object.keys(journey.images).map(key => {
                return journey.images[key].enclosure
            });

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            ctx.drawImage(mapImage, 0, 0);
            ctx.beginPath();
            for (let i = 0; i < allEnclosures.length; i++) {
                let coords = coordinates[allEnclosures[i]];
                if (i === 0) {
                    ctx.moveTo(coords.x, coords.y);
                } else {
                    ctx.lineTo(coords.x, coords.y);
                }
            }
            ctx.stroke();

            for (let i = 1; i < allEnclosures.length - 1; i++) {
                ctx.beginPath();
                let coords = coordinates[allEnclosures[i]];
                ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2, true);
                ctx.fill();
            }

            ctx.fillStyle = '#AB629B';
            ctx.beginPath();
            let fcoords = coordinates[allEnclosures[0]];
            ctx.arc(fcoords.x, fcoords.y, 10, 0, Math.PI * 2, true);
            ctx.fill();

            ctx.fillStyle = '#F7B332';
            ctx.beginPath();
            let lcoords = coordinates[allEnclosures[allEnclosures.length - 1]];
            ctx.arc(lcoords.x, lcoords.y, 10, 0, Math.PI * 2, true);
            ctx.fill();

            let wrapper = document.getElementById('canvas-wrapper');
            while(wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild)
            }

            wrapper.appendChild(this.canvas);

            this.setState({
                mapGenerated: true
            })
        }
        mapImage.src = map;
    }

    saveCanvasImage(e) {
        e.preventDefault();
        this.canvas.toBlob(function(blob) {
            const { user, id } = this.state

            this.setState({
                uploading: true
            })

            let metadata = {
                cacheControl: 'public,max-age=31536000',
                contentType: mimetype,
            }

            let folder = user.uid;
            let reference = `maps/${folder}/${id}/generatedmap.jpg`;
            let uploadTask = firebase.storage().ref(reference).put(blob, metadata);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
                // Progress
            }, (err) => {
                console.error(err.message);
                this.setState({
                    uploading: false
                })
            }, () => {
                // Success
                let downloadURL = uploadTask.snapshot.downloadURL;
                firebase.database().ref(`journeys/${user.uid}/${id}`)
                    .update({
                        generatedMapURL: downloadURL
                    })
                    .then(() => {
                        this.setState({
                            uploading: false
                        }, () => {
                            this.props.routerProps.history.goBack();
                        })
                    })
                    .catch((err) => {
                        console.error(err.message);
                        this.setState({
                            uploading: false
                        })
                    })
            })

        }.bind(this), mimetype);
    }

    render() {
        return (
            <div className="journey-page generate">
                { this.state.uploading ? <Loading fullscreen={true} /> : '' }
                <PageTitle title="Generate" back={() => this.props.routerProps.history.goBack()} />
                <div className="preview-message">
                    {
                        this.state.mapGenerated !== true ? (
                            <Fragment>
                                <p>Using this feature will generate a map with the path you took through the Zoo.</p>
                                <a onClick={(e) => this.startGeneration(e)} className={`btn ${ this.state.journey ? 'fadeIn' : '' }`}>Get Started!</a>
                            </Fragment>
                        ) : ('')
                    }
                </div>
                <div className={`map-preview ${ this.state.mapGenerated ? 'show-map' : '' }`}>
                    <div id="canvas-wrapper" />
                    <a onClick={(e) => this.saveCanvasImage(e)} className="btn fadeIn">Save</a>
                </div>
            </div>
        )
    }
}