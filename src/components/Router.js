/**
 * This uses React Router DOM to display different components to the user. 
 * You will be able to use conditional statements to show different navigations to the user
 * 
 * See documentation here: https://reacttraining.com/react-router/web/guides/philosophy
 * 
 */

import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

import Entry from './Global/Entry'
import Capture from './Journey/Capture'
import Learn from './Learn/Learn';

export default class AppRouter extends Component {
    render() {
        return (
            <Router>
                <Fragment>
                    <div className="navigation">
                        <Link to="/journey">Journey</Link>
                        <Link to="/learn">Learn</Link>
                    </div>

                    <Route exact path="/" component={Entry} />
                    <Route path="/journey" component={Capture} />
                    <Route path="/learn" component={Learn} />
                </Fragment>
            </Router>
        )
    }
}