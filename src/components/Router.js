/**
 * This uses React Router DOM to display different components to the user. 
 * You will be able to use conditional statements to show different navigations to the user
 * 
 * See documentation here: https://reacttraining.com/react-router/web/guides/philosophy
 * 
 */

import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import firebase from 'firebase'

// Global Components
import Entry from './Global/Entry'
import SignInRegister from './Global/SignInRegister'
import Profile from './Global/Profile'
import Claim from './Global/Claim'
import Achievements from './Global/Achievements'
import Loading from './Global/Loading'

// Journey Components
import Journey from './Journey/Journey'
import JourneySingle from './Journey/JourneySingle'
import Capture from './Journey/Capture'
import Generate from './Journey/Generate'

// Learn Components
import Learn from './Learn/Learn';
import SingleQuiz from './Learn/SingleQuiz'

/**
 * AppRouter Class - Handles which component is shown based on URL
 * 
 * @export
 * @class AppRouter
 * @extends {Component}
 */
export default class AppRouter extends Component {
    /**
     * Creates an instance of AppRouter.
     * 
     * @memberof AppRouter
     */
    constructor() {
        super()
        this.state = {
            user: null,
            checkingAuth: true
        }
    }

    /**
     * React Function - See React Lifestyle
     * Checks if a user is logged in and sets state
     * 
     * @memberof AppRouter
     */
    componentDidMount() {
        const _this = this;

        firebase.auth().onAuthStateChanged((user) => {
            _this.setState({
                user: user,
                checkingAuth: false
            })
        })
    }

    /**
     * Renders the Application
     * 
     * @returns DOM
     * @memberof AppRouter
     */
    render() {
        let user = this.state.user;

        // All Public Routes - users will be able to access this without signing in
        const PublicRoutes = () => (
            <Switch>
                <Route path="*" component={SignInRegister} />
            </Switch>
        )

        /**
         * All Private Routes - users will need to sign in
         * 
         * @returns <Switch>
         * @memberof AppRouter
         */
        const PrivateRoutes = () => (
            <Switch>
                <Route exact path="/" component={Entry} />
                <Route exact path="/profile" render={(routeProps) => (
                    <Profile routerProps={routeProps} authUser={user} />
                )} />
                <Route exact path="/profile/claim" render={(routeProps) => (
                    <Claim routerProps={routeProps} authUser={user} />
                )} />
                <Route exact path="/profile/achievements" render={(routeProps) => (
                    <Achievements routerProps={routeProps} authUser={user} />
                )} />
                
                <Route exact path="/journey" render={(routeProps) => (
                    <Journey routerProps={routeProps} authUser={user} />
                )} />
                <Route path="/journey/view/:id" render={(routeProps) => (
                    <JourneySingle routerProps={routeProps} authUser={user} />
                )} />
                <Route exact path="/journey/capture/:id" render={(routeProps) => (
                    <Capture routerProps={routeProps} authUser={user} />
                )} />
                <Route exact path="/journey/generate/:id" render={(routeProps) => (
                    <Generate routerProps={routeProps} authUser={user} />
                )} />

                <Route exact path="/learn" render={(routeProps) => (
                    <Learn routerProps={routeProps} authUser={user} />
                )} />
                <Route path="/doquiz/:id" render={(routeProps) => (
                    <SingleQuiz routerProps={routeProps} authUser={user} />
                )} />
            </Switch>
        )

        /**
         * Returns either the `PublicRoutes` or the `PrivateRoutes` based on user state
         * 
         * @returns DOM
         * @memberof AppRouter
         */
        return (
            <Router>
                {
                    this.state.checkingAuth === true ? (
                        <Loading fullscreen={true} />
                    ) : (
                        <Fragment>
                            {
                                user ? (
                                    <Fragment>
                                        <PrivateRoutes />
                                    </Fragment>
                                ) : (
                                    <PublicRoutes />
                                )
                            }
                        </Fragment>
                    )
                }
            </Router>
        )
    }
}