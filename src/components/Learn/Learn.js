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
/**
 * 
 * 
 * @class QuizSelect
 * @extends {React.Component}
 */
class QuizSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allLearnData: null
        }

        this.renderQuiz = this.renderQuizTitles.bind(this)
    }

    componentDidMount() {
        const _this = this;

        databaseRef.ref(`quiz/`).once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            // console.log(databaseState);
            _this.setState({
                allLearnData: databaseState
            });
        });
    }

    renderQuizTitles() {
        console.log(this.state.allLearnData);

        let quiz = this.state.allLearnData;
        let keysTitle = Object.keys(quiz);
        console.log(keysTitle);

        // console.log(quiz[keys[0]].question);

        let allQuiz = keysTitle.map((key, i) => {
            return (
                <li key={i}>
                    {console.log( keysTitle[i] )}
                    <Link to={`/doquiz/${keysTitle[i]}`}>{keysTitle[i]}</Link>
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
                    { this.renderQuizTitles() }
                </div>
            </div>
        )
    }
}

const Learn = () => {
    return (
        <div id="learn">
            <h1>Learn</h1>
            <QuizSelect/>
        </div>
        
    )
}

export default Learn