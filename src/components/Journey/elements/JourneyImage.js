import React, { Component } from 'react'
import Enclosures from '../../config/enclosures';

import Loading from '../../Global/Loading'

export default class JourneyImage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            editingImage: false,
            selectEnclosureOpen: false,
            selectedEnclosure: '',
            error: false,
            saving: false
        }

        this.toggleEditingState = this.toggleEditingState.bind(this)
        this.saveNewEnclosure = this.saveNewEnclosure.bind(this)
        this.toggleSelectEnclosure = this.toggleSelectEnclosure.bind(this)
        this.renderSelectEnclosure = this.renderSelectEnclosure.bind(this)
        this.selectEnclosure = this.selectEnclosure.bind(this)
    }

    toggleEditingState(e) {
        e.preventDefault();
        this.setState({
            editingImage: !this.state.editingImage,
            selectedEnclosure: '',
            selectEnclosureOpen: false,
            error: false,
            saving: false
        })
    }

    saveNewEnclosure(e) {
        e.preventDefault();
        const _this = this;

        if (this.state.selectedEnclosure === '') {
            this.setState({
                error: true
            })
            return false;
        }

        this.setState({
            saving: true
        })

        var newMeta = {
            customMetadata: {
                'enclosure': this.state.selectedEnclosure
            }
        }

        this.props.DBRef.update({
            enclosure: this.state.selectedEnclosure
        }).then(() => {
            console.log('Success')
        }).catch((err) => {
            console.error(err.message)
        })

        this.props.storageRef.updateMetadata(newMeta).then((metadata) => {
            _this.setState({
                editingImage: !this.state.editingImage,
                selectedEnclosure: '',
                selectEnclosureOpen: false,
                error: false,
                saving: false
            })
        }).catch((err) => {
            console.error(err.message)
        })
    }

    toggleSelectEnclosure(e) {
        e.preventDefault();
        this.setState({
            selectEnclosureOpen: !this.state.selectEnclosureOpen
        })
    }

    selectEnclosure(enclosure) {
        this.setState({
            selectedEnclosure: enclosure
        })
    }

    renderSelectEnclosure() {
        let enclosurses = Enclosures.enclosures;

        let selectOptions = enclosurses.map((enclosure) => (
            <li 
                key={enclosure} 
                onClick={ () => this.selectEnclosure(enclosure) }
                className={`${this.state.selectedEnclosure === enclosure ? 'active' : ''}`}
            >{enclosure}</li>
        ))

        return (
            <div className={`enclosure-select ${ this.state.selectEnclosureOpen ? 'open' : '' }`}>
                <ul className="enclosures">{selectOptions}</ul>
                <a 
                    onClick={(e) => this.toggleSelectEnclosure(e)} 
                    className={`enclosure-toggle ${ this.state.error ? 'error' : '' }`}>
                    {
                        this.state.selectedEnclosure !== '' ? this.state.selectedEnclosure : 'Select Enclosure'
                    }
                </a>
            </div>
        )
    }

    render() {
        return (
            <div className={`single-image ${ this.state.editingImage ? 'editing' : '' }`}>
                { this.state.saving ? <Loading fullscreen={true} /> : '' }
                <img src={this.props.imageURL} alt="Zoo Journey Single" onClick={ (e) => this.toggleEditingState(e) } />
                {
                    this.state.editingImage ? (
                        <div className="journey-dialogue">
                            <div className="dialogue-inner">
                                <div className="image-preview">
                                    <img src={this.props.imageURL} alt="Zoo Journey Single" />
                                </div>

                                { this.renderSelectEnclosure() }

                                <button className="btn" onClick={ (e) => this.saveNewEnclosure(e) }>Save</button>
                                <button className="btn btn-outline" onClick={(e) => this.toggleEditingState(e)}>Cancel</button>
                            </div>
                        </div>
                    ) : ('')
                }
            </div>
        )
    }
}