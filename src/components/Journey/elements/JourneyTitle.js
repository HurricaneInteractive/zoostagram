import React, { Component } from 'react'
import firebase from '../../firebase'

/**
 * SVG Code for the three dots
 * 
 * @returns DOM
 */
const SettingsIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 4">
            <path d="M6,10a2,2,0,1,0,2,2A2.006,2.006,0,0,0,6,10Zm12,0a2,2,0,1,0,2,2A2.006,2.006,0,0,0,18,10Zm-6,0a2,2,0,1,0,2,2A2.006,2.006,0,0,0,12,10Z" transform="translate(-4 -10)"/>
        </svg>
    )
}

/**
 * JourneyTitle class - Used in JourneySingle
 * 
 * @export
 * @class JourneyTitle
 * @extends {Component}
 */
export default class JourneyTitle extends Component {
    /**
     * Creates an instance of JourneyTitle.
     * 
     * @memberof JourneyTitle
     */
    constructor() {
        super()

        this.state = {
            settingsOpen: false,
            title: '',
            renameOpen: false,
            error: false
        }

        this.toggleSettings = this.toggleSettings.bind(this)
        this.onChange = this.onChange.bind(this)
        this.deleteJourney = this.deleteJourney.bind(this)
        this.renameJourney = this.renameJourney.bind(this)
        this.toggleRenameDialogue = this.toggleRenameDialogue.bind(this)
    }

    /**
     * Toggles the state of the settings menu
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyTitle
     */
    toggleSettings(e) {
        e.preventDefault();
        this.setState({
            settingsOpen: !this.state.settingsOpen
        })
    }

    /**
     * Changes the state of the `title`
     * 
     * @param {any} e Input Event Object
     * @memberof JourneyTitle
     */
    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    /**
     * Toggles the state of the edit dialogue box
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyTitle
     */
    toggleRenameDialogue(e) {
        e.preventDefault();
        this.setState({
            renameOpen: !this.state.renameOpen,
            error: false
        })
    }

    /**
     * Delete a record from the DB
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyTitle
     * @description Will be done in Sprint 2
     * 
     * TODO: Delete the Journey + ALL images
     */
    deleteJourney(e) {
        e.preventDefault()
    }

    /**
     * Updates the name of the Journey in the DB & sets the Journey state
     * 
     * @param {any} e Anchor Event Object
     * @returns false - IF the title is empty
     * @memberof JourneyTitle
     */
    renameJourney(e) {
        e.preventDefault()
        const _this = this,
            { id, uid } = this.props,
            { title } = this.state;

        if (title === '') {
            this.setState({
                error: true
            })
            
            return false
        }
        
        firebase.database().ref().child(`journeys/${uid}/${id}`).update({
            journey_name: title
        })
        .then(() => {
            _this.props.updateFakeState(title)
            _this.setState({
                error: false,
                renameOpen: false,
                settingsOpen: false,
                title: ''
            })
        })
    }
    
    /**
     * React Function - Renders the Component Markup
     * 
     * @returns DOM
     * @memberof Journey
     */
    render() {
        return (
            <div className="journey-title">
                <h3>{this.props.title}</h3>
                <div className="journey-settings">
                    <a onClick={ (e) => this.toggleSettings(e) }><SettingsIcon /></a>
                    <ul className={ this.state.settingsOpen === true ? 'open' : '' }>
                        <li><a onClick={ (e) => this.toggleRenameDialogue(e) }>Rename</a></li>
                        <li><a>Delete</a></li>
                    </ul>
                </div>
                {
                    this.state.renameOpen ? (
                        <div className="journey-dialogue">
                            <div className="dialogue-inner">
                                <div className={`input-wrapper ${ this.state.error ? 'error' : '' }`}>
                                    <input placeholder="New Name" value={this.state.title} name="title" id="title" onChange={(e) => this.onChange(e)} />
                                </div>
                                <button className="btn" onClick={(e) => this.renameJourney(e)}>Rename</button>
                                <button className="btn btn-outline" onClick={(e) => this.toggleRenameDialogue(e)}>Cancel</button>
                            </div>
                        </div>
                    ) : ('')
                }
            </div>
        )
    }
}