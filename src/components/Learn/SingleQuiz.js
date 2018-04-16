
import React from 'react'
// import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'

const databaseRef = firebase.database();

class SingleQuiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allLearnData: null,
            quizName: null,
            answersCorrect: 0
        }

       this.renderQuiz = this.renderQuiz.bind(this)
    }

    componentDidMount() {
        const _this = this;

        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            // console.log(databaseState);
            _this.setState({
                allLearnData: databaseState
            });
        });

        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let quizNameYo = snapshot.key;
            // console.log(quizNameYo);
            _this.setState({
                quizName: quizNameYo
            });
        });

    }

    renderQuiz() {
        console.log(this.state);
        const _this = this;

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        console.log(keys);
        console.log(this.state.answersCorrect);

        let allQuiz = Object.keys(quiz).map((key, i) => {
            let quizData = quiz[key];

            let correctAnswer = quizData.answer;
            console.log(correctAnswer);
            return (
                <div key={i}>
                    <h2>{ quizData.question }</h2>
                    <ul>
                        {/* 
                            make the questions go through as a slideshow
                            create onClick event that goes to the next question
                            keep users data until they have submitted - not like its currently adding to the score straight away
                                (just incase they go back and change their answers)
                        */}
                        {
                            quizData.options.map(i => {              
                                return (
                                    <li key={i} onClick={()=>{
                                            let userAnswer = i;
                                            userAnswer === quizData.answer &&
                                            _this.setState({
                                                answersCorrect: this.state.answersCorrect + 1
                                            })
                                        }}>
                                        {console.log(i)}
                                        {i}
                                    </li>
                                    
                                )
                            })
                        }
                    </ul>
                </div>
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
                <h3>Correct Answers: {this.state.answersCorrect}</h3>
                <div>
                    <h2>{this.state.quizName}</h2>
                    { this.renderQuiz() }
                </div>
            </div>
        )
    }
}

/*

quiz name
progression bar
click through questions

*/
export default SingleQuiz