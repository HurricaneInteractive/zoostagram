/**
 * This uses React Router DOM to display different components to the user. 
 * You will be able to use conditional statements to show different navigations to the user
 * 
 * See documentation here: https://reacttraining.com/react-router/web/guides/philosophy
 * 
 */

import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import firebase from 'firebase'

// Global Components
import Entry from './Global/Entry'
import SignInRegister from './Global/SignInRegister'
import Loading from './Global/Loading'

// Journey Components
import Capture from './Journey/Capture'

// Learn Components
import Learn from './Learn/Learn';
import QuizObject from './Learn/QuizObject'

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
                <Route path="/journey" component={Capture} />
                <Route path="/learn" component={Learn} />
                <Route path="/quiz" component={QuizObject} />
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
                                        <div className="navigation">
                                            <Link to="/journey">Journey</Link>
                                            <Link to="/learn">Learn</Link>
                                        </div>

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