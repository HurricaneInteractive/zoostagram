import React from 'react'
// import { Link } from 'react-router-dom'

const SingleQuestion = () => {
    return (
        <div id="quiz-question">
            <h2>{this.state.allLearnData.question}</h2>
            <ul>
                <li>{this.state.allLearnData.options[0]}</li>
                <li>{this.state.allLearnData.options[0]}</li>
                <li>{this.state.allLearnData.options[0]}</li>
                <li>{this.state.allLearnData.options[0]}</li>
            </ul>
        </div>
        
    )
}

console.log(SingleQuestion);

export default SingleQuestion