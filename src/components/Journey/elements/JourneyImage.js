import React, { Component, Fragment } from 'react'
import Enclosures from '../../config/enclosures';
import { FACEBOOK_CONFIG } from '../../config/env';
import FacebookProvider, { Share } from 'react-facebook';

import Loading from '../../Global/Loading'
import { ShareIcon, DeleteIcon } from '../../Global/Icons'

const ImageInformation = (props) => {
    let { imageData, toggleEditingState, toggleViewingState, deleteJourneyPhoto } = props

    return (
        <Fragment>
            <div className="image-preview">
                <img src={imageData.image_url} alt="Zoo Journey Single" />
                
                <FacebookProvider appId={FACEBOOK_CONFIG.APP_ID}>
                    <div className="image-actions">
                        <Share href={imageData.image_url}>
                            <div>
                                <ShareIcon />
                            </div>
                        </Share>

                        <a onClick={(e) => deleteJourneyPhoto(e)}>
                            <DeleteIcon />
                        </a>
                    </div>
                </FacebookProvider>
            </div>
            
            <div className="image-info">
                <p><strong>Enclosure</strong>: {imageData.enclosure.replace('_', ' ')}</p>
                <p><strong>Date taken</strong>: { new Date(imageData.timestamp).toDateString() }</p>
            </div>

            <button className="btn" onClick={ (e) => toggleEditingState(e) }>Edit</button>
            <button className="btn btn-outline" onClick={(e) => toggleViewingState(e)}>Close</button>
        </Fragment>
    )
}

/**
 * Component for the images for the Journey
 * 
 * @export
 * @class JourneyImage
 * @extends {Component}
 */
export default class JourneyImage extends Component {
    /**
     * Creates an instance of JourneyImage.
     * 
     * @param {any} props 
     * @memberof JourneyImage
     */
    constructor(props) {
        super(props)

        this.state = {
            editingImage: false,
            viewingImage: false,
            selectEnclosureOpen: false,
            selectedEnclosure: '',
            error: false,
            saving: false,
            deleting: false
        }

        this.toggleEditingState = this.toggleEditingState.bind(this)
        this.toggleViewingState = this.toggleViewingState.bind(this)
        this.saveNewEnclosure = this.saveNewEnclosure.bind(this)
        this.toggleSelectEnclosure = this.toggleSelectEnclosure.bind(this)
        this.renderSelectEnclosure = this.renderSelectEnclosure.bind(this)
        this.selectEnclosure = this.selectEnclosure.bind(this)
        this.deleteJourneyPhoto = this.deleteJourneyPhoto.bind(this)
    }

    /**
     * Toggles the state of the edit dialogue
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyImage
     */
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

    /**
     * Toggles the state of the image viewing dialogue
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyImage
     */
    toggleViewingState(e) {
        e.preventDefault();
        this.setState({
            viewingImage: !this.state.viewingImage
        })
    }

    /**
     * Updates the enclosure in the DB and in the Storage
     * 
     * @param {any} e Anchor Event Object
     * @returns false If the `selectedEnclosure` is empty
     * @memberof JourneyImage
     */
    saveNewEnclosure(e) {
        e.preventDefault();
        const _this = this;
        const { selectedEnclosure } = this.state;
        const { id, DBRef, storageRef } = this.props;

        if (selectedEnclosure === '') {
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
                'enclosure': selectedEnclosure
            }
        }

        DBRef.update({
            enclosure: selectedEnclosure
        }).then(() => {
            // Success
        }).catch((err) => {
            console.error(err.message)
        })

        storageRef.updateMetadata(newMeta).then((metadata) => {
            _this.props.updateFakeState(id, selectedEnclosure);

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

    /**
     * Deletes image from DB and Storage
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyImage
     */
    deleteJourneyPhoto(e) {
        e.preventDefault();
        let { DBRef, storageRef, afterImageDelete } = this.props;

        this.setState({
            saving: true
        })

        DBRef.remove();
        storageRef.delete().then(() => {
            afterImageDelete()
        });
    }

    /**
     * Toggles the state of the enclosure select box
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyImage
     */
    toggleSelectEnclosure(e) {
        e.preventDefault();
        this.setState({
            selectEnclosureOpen: !this.state.selectEnclosureOpen
        })
    }

    /**
     * Sets the `selectedEnclosure`
     * 
     * @param {string} enclosure Enclosure text
     * @memberof JourneyImage
     */
    selectEnclosure(enclosure) {
        this.setState({
            selectedEnclosure: enclosure
        })
    }

    /**
     * Render the enclosure select field and list items
     * 
     * @returns DOM
     * @memberof JourneyImage
     */
    renderSelectEnclosure() {
        let enclosurses = Enclosures.enclosures;

        let selectOptions = enclosurses.map((enclosure) => (
            <li 
                key={enclosure} 
                onClick={ () => this.selectEnclosure(enclosure) }
                className={`${this.state.selectedEnclosure === enclosure ? 'active' : ''}`}
            >{enclosure.replace('_', ' ')}</li>
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
    
    /**
     * React Function - Renders the Component Markup
     * 
     * @returns DOM
     * @memberof Journey
     */
    render() {
        let { imageData } = this.props;
        return (
            <div className={`single-image ${ this.state.editingImage ? 'editing' : '' } ${ this.state.viewingImage ? 'viewing' : '' }`}>
                { this.state.saving ? <Loading fullscreen={true} /> : '' }
                <img src={imageData.image_url} alt="Zoo Journey Single" onClick={ (e) => this.toggleViewingState(e) } />
                {
                    this.state.viewingImage ? (
                        <div className="journey-dialogue">
                            <div className="dialogue-inner">
                                <ImageInformation 
                                    imageData={imageData} 
                                    toggleEditingState={(e) => this.toggleEditingState(e)} 
                                    toggleViewingState={(e) => this.toggleViewingState(e)}
                                    deleteJourneyPhoto={(e) => this.deleteJourneyPhoto(e)}
                                />
                            </div>
                        </div>
                    ) : ('')
                }

                {
                    this.state.editingImage ? (
                        <div className="journey-dialogue">
                            <div className="dialogue-inner">
                                <div className="image-preview">
                                    <img src={imageData.image_url} alt="Zoo Journey Single" />
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