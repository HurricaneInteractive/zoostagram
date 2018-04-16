/**
 * Placeholder Capture Component
 * 
 * Currently being used by AJ to test image capturing
 */

// eslint-disable-next-line
import React from 'react'
// eslint-disable-next-line
import { Link, Route, Router } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'

const databaseRef = firebase.database();

class QuizSelect extends React.Component {
    constructor() {
        super();

        this.state = {
            allLearnData: null
        }

        this.renderQuiz = this.renderQuiz.bind(this)
    }

    componentDidMount() {
        const _this = this;

        databaseRef.ref('/quiz').once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            // console.log(snapshot.val());
            _this.setState({
                allLearnData: databaseState
            });
        });
    }

    renderQuiz() {
        console.log(this.state.allLearnData);

        let quiz = this.state.allLearnData.lions;
        let keys = Object.keys(quiz);
        console.log(keys);

        // console.log(quiz[keys[0]].question);

        let allQuiz = Object.keys(quiz).map((key, i) => {
            return (
                <li key={i}>
                    { quiz[key].question }
                </li>
            )
        })

        return allQuiz;
    }

    render() {

        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }
      
        return (
            <div className="quiz-container">
                <div>
                    { this.renderQuiz() }
                </div>
            </div>
        )
    }
}

const UrlSelector = () => (
    <div>
        <Link to="/doquiz/lions">Lions</Link>
        <Link to="/doquiz/pandas">Pandas</Link>
    </div>
    
)

/*

quiz name
progression bar
click through questions

*/

const Learn = () => {
    return (
        <div>
            <h1>Learn</h1>
            <Link to="/">link</Link>
            <QuizSelect/>
            <UrlSelector />
        </div>
        
    )
}

export default Learn