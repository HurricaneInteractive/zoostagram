import React, { Component, Fragment } from 'react'
import firebase from '../firebase';

import Loading from './Loading'
import Logo from './Logo'

import agouti from '../../images/welcome/agouti-sign-in.png'
import eland from '../../images/welcome/eland-sign-in.png'
import deer from '../../images/welcome/deer-sign-in.png'

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
            name: '',
            email: '',
            password: '',
            register: null,
            processing: false,
            errorMsg: '',
            errorName: '',
            homeImage: agouti
        }

        // Bind events
        this.togglePills = this.togglePills.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onSubmission = this.onSubmission.bind(this)
        this.createUserEntry = this.createUserEntry.bind(this)
        this.handleErrors = this.handleErrors.bind(this)
        this.generateRegisterForm = this.generateRegisterForm.bind(this)
        this.generateSignInForm = this.generateSignInForm.bind(this)
        this.renderFormActions = this.renderFormActions.bind(this)
    }

    componentDidMount() {
        let allImages = [agouti, eland, deer]
        let min = 0
        let max = Math.floor(allImages.length - 1)
        let rand = Math.floor(Math.random() * (max - min + 1)) + min;
        this.setState({
            homeImage: allImages[rand]
        })
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
            register: state,
            errorMsg: ''
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
     */
    onSubmission(e) {
        e.preventDefault();
        const _this = this;
        let { name, email, password, register } = this.state;

        this.setState({
            errorMsg: '',
            errorName: ''
        })

        if (register === true) {
            if (name === '') {
                this.setState({
                    errorMsg: 'Name field is required',
                    errorName: 'name'
                })
                return false;
            }
        }

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
        let name = this.state.name;

        return firebase.database().ref(`users/${user.uid}`)
            .set({
                email: email,
                points: 0,
                achievements: 0
            })
            .then(() => {
                return user.updateProfile({
                    displayName: name
                }).then(() => {}).catch((err) => {
                    console.error('Register Error', err);
                })
            })
    }

    /**
     * Handle all errors created by Firebase Objects
     * 
     * @param {object} error Firebase Error Object
     */
    handleErrors(error) {
        let name = '';

        name = error.message.includes('email') > 0 ? 'email' : '';
        name = error.message.includes('password') > 0 ? 'password' : name;

        this.setState({
            processing: false,
            errorMsg: error.message,
            errorName: name
        })
    }

    /**
     * Renders the Form Actions & Error messages
     * 
     * @returns DOM
     * @memberof SignInRegister
     */
    renderFormActions() {
        return (
            <div className="form-actions">
                { this.state.errorMsg !== '' ? (<div className="form-error">*&nbsp;{this.state.errorMsg}</div>) : ('') }
                <button type="submit" className="btn btn-outline btn-arrow-right">
                    {this.state.register === true ? 'Register' : 'Sign In'}
                </button>
                <a className="below-button-back" onClick={(e) => this.togglePills(e, !this.state.register)}>
                    {this.state.register === true ? 'Sign In' : 'Register'}
                </a>
            </div>
        )
    }

    /**
     * Renders the Sign In Form
     * 
     * @returns DOM
     * @memberof SignInRegister
     */
    generateSignInForm() {
        return (
            <Fragment>
                <div className="register-bg giraffe" />
                <form id="signin-register-form" onSubmit={ (e) => this.onSubmission(e) }>
                    <div className={`input-wrapper ${ this.state.errorName === 'email' ? 'cross error' : '' } ${ this.state.errorName === 'password' ? 'tick' : '' }`}>
                        <input 
                            placeholder="Email Address" 
                            name="email" 
                            id="email" 
                            type="email" 
                            value={this.state.email} 
                            onChange={ (e) => this.onChange(e) } 
                        />
                    </div>
                    <div className={`input-wrapper ${ this.state.password !== '' && this.state.errorName !== 'password' ? 'tick' : '' } ${ this.state.errorName === 'password' ? 'cross error' : '' }`}>
                        <input 
                            placeholder="Password" 
                            name="password" 
                            id="password" 
                            type="password" 
                            value={this.state.password} 
                            onChange={ (e) => this.onChange(e) }
                        />
                    </div>
                    { this.renderFormActions() }
                </form>
            </Fragment>
        )
    }

    /**
     * Renders the Register Form
     * 
     * @returns DOM
     * @memberof SignInRegister
     */
    generateRegisterForm() {
        return (
            <Fragment>
                <div className="register-bg cheetah" />
                <form id="signin-register-form" onSubmit={ (e) => this.onSubmission(e) }>
                    <div className={`input-wrapper ${ this.state.name !== '' && this.state.errorName !== 'name' ? 'tick' : '' } ${ this.state.errorName === 'name' ? 'cross error' : '' }`}>
                        <input 
                            placeholder="Name" 
                            name="name" 
                            id="name" 
                            type="text" 
                            value={this.state.name} 
                            onChange={ (e) => this.onChange(e) }
                        />
                    </div>
                    <div className={`input-wrapper ${ this.state.errorName === 'email' ? 'cross error' : '' } ${ this.state.errorName === 'password' ? 'tick' : '' }`}>
                        <input 
                            placeholder="Email Address" 
                            name="email" 
                            id="email" 
                            type="email" 
                            value={this.state.email} 
                            onChange={ (e) => this.onChange(e) } 
                        />
                    </div>
                    <div className={`input-wrapper ${ this.state.password !== '' && this.state.errorName !== 'password' ? 'tick' : '' } ${ this.state.errorName === 'password' ? 'cross error' : '' }`}>
                        <input 
                            placeholder="Password" 
                            name="password" 
                            id="password" 
                            type="password" 
                            value={this.state.password} 
                            onChange={ (e) => this.onChange(e) }
                        />
                    </div>
                    { this.renderFormActions() }
                </form>
            </Fragment>
        )
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
            <div className="page sign-in-register purple-grain-bg">
                <Logo />
                <div className="sign-in-wrapper">
                    { 
                        this.state.register !== null ? (
                            <div className="form-wrapper">
                                { this.state.register ? ( this.generateRegisterForm() ) : ( this.generateSignInForm() ) }
                            </div>
                        ) : (
                            <Fragment>
                                <div className="register-bg" style={{ backgroundImage: `url(${this.state.homeImage})` }} />
                                <div className="select-path">
                                    <a className={`btn`} onClick={ (e) => this.togglePills(e, true) }>Register</a>
                                    <a className={`btn btn-secondary`} onClick={ (e) => this.togglePills(e, false) }>Sign In</a>
                                </div>
                            </Fragment>
                        )
                    }
                </div>
            </div>
        )
    }
}