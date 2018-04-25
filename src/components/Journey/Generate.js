import React, { Component } from 'react'
import PageTitle from '../Global/PageTitle'
import firebase from '../firebase'
import Enclosures from '../config/enclosures'


import map from '../../images/zoo_map.jpg'
const mapWidth = 500;
const mapHeight = 500;

export default class Generate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.authUser,
            id: this.props.routerProps.match.params.id,
            journey: null
        }

        this.canvas = null;

        this.startGeneration = this.startGeneration.bind(this)
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
            // this.canvas = document.getElementById('generated-map');
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
        }
        mapImage.src = map;
    }

    render() {
        return (
            <div className="journey-page generate">
                <PageTitle title="Generate" back={() => this.props.routerProps.history.goBack()} />
                <div className="preview-message">
                    <p>Using this feature will generate a map with the path you took through the Zoo.</p>
                    <a onClick={(e) => this.startGeneration(e)} className={`btn ${ this.state.journey ? 'fadeIn' : '' }`}>Get Started!</a>
                    { /* <canvas id="generated-map" /> */ }
                    <div id="canvas-wrapper" />
                </div>
            </div>
        )
    }
}