import React, { Component } from 'react'
import firebase from '../firebase';

import Loading from './Loading'

/**
 * Shows the Sign In / Register Page
 * 
 * @export
 * @class SignInRegister
 * @extends {Component}
 */
export default class SignInRegister extends Component {
    /**
     * Creates an instance of SignInRegister.
     * 
     * @memberof SignInRegister
     */
    constructor() {
        super()
        this.state = {
            email: '',
            password: '',
            register: true,
            processing: false
        }

        // Bind events
        this.togglePills = this.togglePills.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onSubmission = this.onSubmission.bind(this)
        this.createUserEntry = this.createUserEntry.bind(this)
        this.handleErrors = this.handleErrors.bind(this)
    }

    /**
     * Toggles what the user whats to do - either Sign In or Register
     * 
     * @param {Object} e Anchor click Event
     * @param {boolean} state If the user is registering or not (true/false)
     * @memberof SignInRegister
     */
    togglePills(e, state) {
        e.preventDefault();
        this.setState({
            register: state
        })
    }

    /**
     * Changes the state values for the input elems
     * 
     * @param {object} e Event Object
     * @memberof SignInRegister
     */
    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    /**
     * Signs the user in or creates a new one based on state
     * 
     * @param {object} e Event Object
     * @memberof SignInRegister
     * 
     * TODO: Handle different possible errors - existing user etc
     */
    onSubmission(e) {
        e.preventDefault();
        const _this = this;
        let { email, password, register } = this.state;

        this.setState({
            processing: true
        })
        
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                switch(register) {
                    // Sign In
                    case false:
                        return firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
                            _this.handleErrors(err);
                        });
                    // Register a user
                    default:
                        firebase.auth().createUserWithEmailAndPassword(email, password)
                            .then((user) => {
                                _this.createUserEntry(user)
                            })
                            .catch((err) => {
                                _this.handleErrors(err);
                            });
                        break;
                }
            })
            .catch((err) => {
                _this.handleErrors(err);
            })
    }

    /**
     * Creates a new DB entry for the user and saves the email
     * 
     * @param {object} user Firebase User Object
     */
    createUserEntry(user) {
        let email = this.state.email;

        return firebase.database().ref(`users/${user.uid}`)
            .set({
                email: email
            })
            .then(() => user)
    }

    /**
     * Handle all errors created by Firebase Objects
     * 
     * @param {object} error Firebase Error Object
     * 
     * TODO: Complete functionality
     */
    handleErrors(error) {
        console.error(error.message);
        this.setState({
            processing: false
        })
    }

    /**
     * React Function - Renders the DOM for this Component
     * 
     * @returns DOM
     * @memberof SignInRegister
     */
    render() {
        if (this.state.processing === true) {
            return <Loading fullscreen={true} />
        }

        return(
            <div className="page sign-in-register">
                <div className="toggle-pills">
                    <a className={`${ this.state.register === true ? 'active' : '' }`} onClick={ (e) => this.togglePills(e, true) }>Register</a>
                    <a className={`${ this.state.register !== true ? 'active' : '' }`} onClick={ (e) => this.togglePills(e, false) }>Sign In</a>
                </div>
                <div className="form-wrapper">
                    <form id="signin-register-form" onSubmit={ (e) => this.onSubmission(e) }>
                        <input placeholder="Email Address" name="email" id="email" type="text" value={this.state.email} onChange={ (e) => this.onChange(e) } />
                        <input placeholder="Password" name="password" id="password" type="password" value={this.state.password} onChange={ (e) => this.onChange(e) } />
                        <button type="submit" className="btn">{ this.state.register ? 'Register' : 'Sign In' }</button>
                    </form>
                </div>
            </div>
        )
    }
}