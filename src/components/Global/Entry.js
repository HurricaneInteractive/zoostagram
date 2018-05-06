/**
 * Placeholder Entry (or Home) page of the application
 * 
 * This is just to test the Router + to develop functionality while designs are finalised
 */

import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import ProfileImage from './ProfileImage'

const Entry = () => {
    return(
        <div className="page app-home purple-grain-bg">
            <div className="app-header">
                <Logo />
                <ProfileImage />
            </div>
            <div className="app-feature-options">
                <ul>
                    <li className="ape-bg"><Link to="/learn">Learn</Link></li>
                    <li className="elephant-bg"><Link to="/journey">Journey</Link></li>
                </ul>
            </div>
            <p className="user-message">Select One To Start</p>
        </div>
    )
}

export default Entry;