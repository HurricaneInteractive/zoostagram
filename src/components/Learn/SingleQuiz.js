
import React from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'
import PageTitle from '../Global/PageTitle';

const databaseRef = firebase.database();
/**
 * 
 * 
 * @class SingleQuiz
 * @extends {React.Component}
 */
class SingleQuiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allLearnData: null,
            quizName: null,
            answersCorrect: 0,
            userAnswers: [],
            userProgression: 0,
            totalQuestions: 0,
            quizDone: false
        }

       this.renderQuiz = this.renderQuiz.bind(this)
    }

    componentDidMount() {
        const _this = this;

        // gets quiz information based on the url params
        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            let quizNameYo = snapshot.key;
            _this.setState({
                allLearnData: databaseState,
                quizName: quizNameYo
            });
        });
        
        
    }

    // checks if the option has been selected and updates the userAnswers state
    clickHandler(question) {
        if (typeof this.state.userAnswers[this.state.userProgression] === 'undefined') {
            let newAnswers = this.state.userAnswers;
            newAnswers.push(question);
            this.setState({
                userAnswers: newAnswers
            })
        } 
        else {
            let updatedAnswers = this.state.userAnswers;
            updatedAnswers[this.state.userProgression] = question;
            this.setState({
                userAnswers: updatedAnswers
            })
        }
    }

    isTheQuizOver(keyLength) {
        if (this.state.userProgression === keyLength) {
            this.setState ({
                quizDone: true
            })
        }
        else {
            this.setState ({
                quizDone: false
            })
        }
    }

    renderQuiz() {
        // console.log(this.state);
        const _this = this;

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        let keyLength = keys.length;
        // console.log(keyLength);

        let quizProgression = quiz[keys[this.state.userProgression]];
        let progressionPercentage = this.state.userProgression / keys.length * 100;

        console.log("display quiz")
        if (this.state.userProgression === keyLength) {
            console.log("break me")
            return (
                <div>
                    { console.log("nothing to return") }
                    <h2>Quiz Complete</h2>
                    <h3>You got </h3>
                    <Link to="/">hola</Link>
                    <PageTitle to="/"></PageTitle>
                </div>
            )
        }
        return (
            <div>
                <div className="progressionBar">
                    <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                </div>
                <h2>{ quizProgression.question }</h2>
                    <button onClick={()=>{
                        _this.setState({
                            userProgression: this.state.userProgression - 1
                        })
                    }}
                    >{"< back"}</button>
                <ul> 
                    {    
                        quizProgression.options.map((question, i) => {
                            let questionAnswerClass = "quizOption";

                            if (typeof this.state.userAnswers[this.state.userProgression] !== 'undefined') {
                                if (this.state.userAnswers[this.state.userProgression] === question) {
                                    questionAnswerClass += ' active';
                                }
                            }
                            return (
                                <li key={i}
                                    className={`${questionAnswerClass}`}
                                    onClick={ () => this.clickHandler(question) }
                                >
                                    {question}
                                </li>
                            )
                        })
                    }
                </ul>
                    <button onClick={()=>{
                        _this.setState({
                            userProgression: this.state.userProgression + 1
                        })
                    }}
                    >{"forward >"}</button>
            </div>
        )
    }

    render() {
        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }
      
        return (
            <div className="quiz-container">
                <div>
                    <h2>{this.state.quizName}</h2>
                    { this.renderQuiz() }
                </div>
            </div>
        )
    }
}

export default SingleQuiz