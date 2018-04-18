/**
 * Component for the Page title.
 * 
 * @param {string} title Heading Title
 * @param {function} back React Router DOM history function - see Journey.js for an example
 */

import React from 'react'

const PageTitle = (props) => {
    return (
        <div className="page-title">
            {
                typeof props.back === 'function' ? (
                    <a onClick={() => props.back()} className="back-arrow">Back</a>
                ) : ('')
            }
            <h1>{props.title}</h1>
        </div>
    )
}

export default PageTitle