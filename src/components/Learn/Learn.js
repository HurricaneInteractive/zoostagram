/**
 * Placeholder Capture Component
 * 
 * Currently being used by AJ to test image capturing
 */

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'

const databaseRef = firebase.database();

class QuizSelect extends Component {
    constructor() {
        super();
        this.state = {
            allLearnData: null
        }
    }

    componentDidMount() {
        const _this = this;

        return databaseRef.ref('/').once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            console.log(snapshot.val());
            _this.setState({
                allLearnData: databaseState
            });
        });
    }

    render() {

        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }
      
        return (
            <div className="camera-feed">
                <p>pls work</p>
                <p>{this.state.allLearnData.quiz.quiz_one.question_one}</p>
                <p>{this.state.allLearnData.answers.quiz_one.answer_one}</p>
            </div>
        )
    }
}

const Learn = () => {
    return (
        <div>
            <h1>Learn</h1>
            <Link to="/">link</Link>
            <QuizSelect/>
        </div>
        
    )
}

export default Learn