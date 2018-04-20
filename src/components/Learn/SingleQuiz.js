
import React from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'
// import PageTitle from '../Global/PageTitle';

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
            correctAnswers: [],
            userProgression: 0,
            userPoints: 0,
            userPercentage: 50
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
    clickHandler(question, answer, quizProgression) {
        if (typeof this.state.userAnswers[this.state.userProgression] === 'undefined') {
            let newAnswers = this.state.userAnswers;
            newAnswers.push(question);

            let theAnswers = this.state.correctAnswers;
            theAnswers.push(answer);
            console.log("the OG answers" + theAnswers)

            this.setState({
                userAnswers: newAnswers,
                correctAnswers: theAnswers
            })
        }
        else {
            let updatedAnswers = this.state.userAnswers;
            updatedAnswers[this.state.userProgression] = question;

            let updatedTheAnswers = this.state.correctAnswers
            updatedTheAnswers[this.state.userProgression] = answer;
            console.log("updated answers" + updatedTheAnswers)

            this.setState({
                userAnswers: updatedAnswers,
                correctAnswers: updatedTheAnswers
            })
        }
    }

    checkThemAnswers() {
        console.log("loop coming");

        const totalQuestionsAsked = this.state.correctAnswers.length;
        // console.log(this.state.correctAnswers)

        for (let i = 0; i < totalQuestionsAsked; i++) {
            console.log("correctAnswer from i " + this.state.correctAnswers[i]);
            console.log("userAnswer from i " + this.state.userAnswers[i]);
            console.log("just the - " + i);

            let compareUser = JSON.stringify(this.state.userAnswers[i]);
            let compareCorrect = JSON.stringify(this.state.correctAnswers[i]);

            if (compareUser === compareCorrect) {
                let updatedPoints = this.state.userPoints;
                console.log("updated points value = " + updatedPoints)
                this.setState({
                    userPoints: updatedPoints + 1
                })
            }
            else {
                console.log("no points today m8")
            }
        }
    }

    renderQuiz() {
        // console.log(this.state);
        const _this = this;

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        let keyLength = keys.length;

        let quizProgression = quiz[keys[this.state.userProgression]];

        let progressionPercentage = this.state.userProgression / keys.length * 100;

        if (this.state.userProgression === keyLength) {

            
            return (
                <div>
                    {this.checkThemAnswers()}
                    <h2>Congradulations</h2>
                    <h3>You completed The Quiz on {this.state.quizName}</h3>
                    <div>
                        <h2>{"" + this.state.userPercentage + "%"}</h2>
                        <h3>{"Questions Answered Correctly"}</h3>
                    </div>
                    <Link to="/learn">Back to Quiz Map</Link>
                    <Link to="/">Take The Quiz Again</Link>
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
                            let answers = quizProgression.answer
                            // console.log(answers)

                            if (typeof this.state.userAnswers[this.state.userProgression] !== 'undefined') {
                                if (this.state.userAnswers[this.state.userProgression] === question) {
                                    questionAnswerClass += ' active';
                                }
                            }
                            return (
                                <li key={i}
                                    className={`${questionAnswerClass}`}
                                    
                                    onClick={ () => this.clickHandler(question, answers, quizProgression) }
                                >
                                    {/* {console.log(question)} */}
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