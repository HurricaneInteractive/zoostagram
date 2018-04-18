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