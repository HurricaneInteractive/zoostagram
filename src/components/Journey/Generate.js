import React, { Component, Fragment } from 'react'
import firebase from '../firebase'
import Loading from '../Global/Loading'

import PageTitle from '../Global/PageTitle'
import Enclosures from '../config/enclosures'

// Map settings
const mapWidth = 375
const mapHeight = 800
const mimetype = 'image/jpeg'

/**
 * Component to generate the journey map
 * 
 * @export
 * @class Generate
 * @extends {Component}
 */
export default class Generate extends Component {
    /**
     * Creates an instance of Generate.
     * 
     * @param {any} props 
     * @memberof Generate
     */
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            id: this.props.routerProps.match.params.id,
            journey: null,
            mapGenerated: false,
            uploading: false
        }

        this.canvas = null
        this.canvasBG = '#ff6464'

        this.startGeneration = this.startGeneration.bind(this)
        this.saveCanvasImage = this.saveCanvasImage.bind(this)
        this.setupCanvas = this.setupCanvas.bind(this)
        this.drawAnimals = this.drawAnimals.bind(this)
        this.drawConnectingLines = this.drawConnectingLines.bind(this)
        this.drawMainPointsCircle = this.drawMainPointsCircle.bind(this)
        this.drawMidPointCircle = this.drawMidPointCircle.bind(this)
    }

    /**
     * React Function - See React Lifecycle
     * Fetches the journey data from DB based on URL id
     * 
     * @memberof Generate
     */
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

    /**
     * Initial canvas setup
     * 
     * @memberof Generate
     */
    setupCanvas = (ctx) => {
        ctx.fillStyle = this.canvasBG
        ctx.rect(0, 0, mapWidth, mapHeight)
        ctx.fill()
    }

    /**
     * Draws all the animals on the canvas
     * 
     * @memberof Generate
     */
    drawAnimals = (ctx, key, data, userEnclosures) => {
        let image = new Image();
        let alpha = 1.0;

        alpha = userEnclosures.includes(key) ? 1.0 : 0.3;

        image.onload = () => {
            let x = data.x - (data.width / 2);
            let y = data.y - (data.height / 2);
            
            ctx.globalAlpha = alpha;
            ctx.drawImage(image, x, y, data.width, data.height);
        }
        image.src = data.img;
    }

    /**
     * Draws the larger circles for the trip beginning and ending
     * 
     * @memberof Generate
     */
    drawMainPointsCircle = (ctx, fill, coords) => {
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 10, 0, Math.PI * 2, true);
        ctx.fill();
    }

    /**
     * Draws the small circles for the trip mid points
     * 
     * @memberof Generate
     */
    drawMidPointCircle = (ctx, coords) => {
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 3, 0, Math.PI * 2, true);
        ctx.fill();
    }

    /**
     * Draws lines connecting the enclosures based on the images the user took and tagged
     * 
     * @memberof Generate
     */
    drawConnectingLines = (ctx, allEnclosures) => {
        let { coordinates } = Enclosures;
        
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.strokeStyle = 'white'

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
    }

    /**
     * Generates the journey map based on the users journey images and their tags
     * 
     * @param {object} e Anchor Event Object
     * @memberof Generate
     */
    startGeneration(e) {
        e.preventDefault();
        let { journey } = this.state;
        let { coordinates } = Enclosures;
        let wrapper = document.getElementById('canvas-wrapper');
        
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', mapWidth);
        this.canvas.setAttribute('height', mapHeight);

        let ctx = this.canvas.getContext('2d');

        let allEnclosures = Object.keys(journey.images).map(key => {
            return journey.images[key].enclosure
        });

        this.setupCanvas(ctx)

        this.drawConnectingLines(ctx, allEnclosures)

        Object.keys(coordinates).map((item) => (
            this.drawAnimals(ctx, item, coordinates[item], allEnclosures)
        ))

        for (let i = 1; i < allEnclosures.length - 1; i++) {
            this.drawMidPointCircle(ctx, coordinates[allEnclosures[i]])
        }
        
        this.drawMainPointsCircle(ctx, 'white', coordinates[allEnclosures[0]])
        this.drawMainPointsCircle(ctx, 'white', coordinates[allEnclosures[allEnclosures.length - 1]])
        
        while(wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild)
        }
        wrapper.appendChild(this.canvas);

        this.setState({
            mapGenerated: true
        })
    }

    /**
     * Converts the canvas to a `Blob` and saves the image into the DB & Storage
     * 
     * @param {object} e Anchor Event Object
     * @memberof Generate
     */
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

    /**
     * Reacts function - Renders the Component Markup
     * 
     * @returns DOM
     * @memberof Generate
     */
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
                    <div id="canvas-wrapper" height={mapHeight} />
                    <a onClick={(e) => this.saveCanvasImage(e)} className="btn fadeIn">Save</a>
                </div>
            </div>
        )
    }
}