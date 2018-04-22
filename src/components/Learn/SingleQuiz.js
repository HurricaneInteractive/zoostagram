/**
 * @requires BETTER VARIABLE NAMES PLEASE!
 */
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
            userID: null,
            allUserData: null,
            allLearnData: null,
            quizName: null,
            userAnswers: [],
            correctAnswers: [],
            userProgression: 0,
            userPoints: 0,
            userPercentage: 50,
            updatedUserData: null
        }

       this.renderQuiz = this.renderQuiz.bind(this)
       this.pushTheData = this.pushTheData.bind(this)
       this.updateHighScore = this.updateHighScore.bind(this)
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

        _this.setState({
            userID: firebase.auth().currentUser.uid
        });
        // get current users information/stats
        databaseRef.ref(`users/${firebase.auth().currentUser.uid}`).once('value').then(function(snapshot){
            let userDataHere = snapshot.val();
            _this.setState({
                allUserData: userDataHere
            })
        });
    }

    // checks if the option has been selected and updates the userAnswers state
    clickHandler(question, answer, quizProgression) {
        if (typeof this.state.userAnswers[this.state.userProgression] === 'undefined') {
            let newAnswers = this.state.userAnswers;
            newAnswers.push(question);

            let theAnswers = this.state.correctAnswers;
            theAnswers.push(answer);
            // console.log("the OG answers" + theAnswers)

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
            // console.log("updated answers" + updatedTheAnswers)

            this.setState({
                userAnswers: updatedAnswers,
                correctAnswers: updatedTheAnswers
            })
        }
    }

    checkThemAnswers() {
        const totalQuestionsAsked = this.state.correctAnswers.length;
        // console.log(this.state.correctAnswers)
        let updatedPoints = 0;

        for (let i = 0; i < totalQuestionsAsked; i++) {

            let compareUser = JSON.stringify(this.state.userAnswers[i]);
            let compareCorrect = JSON.stringify(this.state.correctAnswers[i]);

            if (compareUser === compareCorrect) {
                updatedPoints = updatedPoints + 1;
            }
        }
        return updatedPoints
    }

    /**
     * Calls the Firebase update method on quiz_attempts for this quiz
     * 
     * @param {int} points Points to replace the current High Score
     * @memberof SingleQuiz
     */
    updateHighScore(points) {
        const { userID, quizName } = this.state;
        const quizAttemptsRef = firebase.database().ref(`users/${userID}/quiz_attempts/${quizName}`);

        let updateData = {
            hs: points
        }

        quizAttemptsRef.update(updateData)
            .then(() => {
                console.log('Successfully Added');
            }).catch((err) => {
                console.error(err.message);
            })
    }

    /**
     * Updates the Users High Score for quiz
     * Firstly: checks to see if quiz_attempts exists,
     * Secondly: checks if the quiz has been done before
     * Thirdly: compares the current High Score to `pointsToPush`
     * 
     * @param {int} pointsToPush Points to compare to the current High Score
     * @memberof SingleQuiz
     */
    pushTheData(pointsToPush) {
        let { allUserData, quizName } = this.state;

        if (typeof allUserData.quiz_attempts === 'undefined') {
            this.updateHighScore(pointsToPush);
        }
        else {
            if (typeof allUserData.quiz_attempts[quizName] === 'undefined') {
                this.updateHighScore(pointsToPush);
            }
            else {
                let currentHighScore = allUserData.quiz_attempts[quizName].hs;
                if (currentHighScore < pointsToPush) {
                    this.updateHighScore(pointsToPush);
                }
            }
        }
    }

    resetQuiz() {
        this.setState({
            userID: null,
            allUserData: null,
            allLearnData: null,
            quizName: null,
            userAnswers: [],
            correctAnswers: [],
            userProgression: 0,
            userPoints: 0,
            userPercentage: 0
        })
    }

    renderQuiz() {
        // console.log(this.state);
        const _this = this;

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        let keyLength = keys.length;

        let quizProgression = quiz[keys[this.state.userProgression]];
        let progressionPercentage = this.state.userProgression / keys.length * 100;

        let updateTheScore = 0;

        let buttonButton = "Next";

        if (this.state.userProgression === keyLength - 1) {
            buttonButton = "Results"
        }

        if (this.state.userProgression === keyLength) {
            updateTheScore = this.checkThemAnswers();
            let pointsToPush = updateTheScore;

            let userScoreFraction = JSON.stringify(updateTheScore) + "/" + JSON.stringify(keys.length);
            let userScorePercentage = updateTheScore / keys.length * 100;
            let roundedUserScorePercentage = Math.round(userScorePercentage);

            // function here to push user score (updateTheScore) back to the DB
            this.pushTheData(pointsToPush);

            return (
                <div>
                    <div className="progressionBar">
                        <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                    </div>
                    {/* { console.log("inside return " + updateTheScore) } */}
                    <h2>Congradulations</h2>
                    <h3>You completed The Quiz on {this.state.quizName}</h3>
                    <div>
                        <h2>{"" + roundedUserScorePercentage + "%"}</h2>
                        <h3>{userScoreFraction + " Questions Answered Correctly"}</h3>
                    </div>
                    <Link to="/learn">Back to Quiz Map</Link>
                    <Link to={"/"} onClick={ () => this.resetQuiz()}>Take The Quiz Again</Link>
                </div>
            )
        }

        return (
            <div>
                <div className="progressionBar">
                    <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                </div>
                <div>
                    <p>{ "Question " + (this.state.userProgression + 1) }</p>
                </div>
                <div className="questionContainer">
                    <h2>{ quizProgression.question }</h2>
                        
                    <ul className="quizQuestions"> 
                        {
                            quizProgression.options.map((question, i) => {
                                let questionAnswerClass = "quizOption";
                                let answers = quizProgression.answer;

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
                                        {question}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                <button className="backArrow" onClick={()=>{
                    if (this.state.userProgression === 0) {
                        console.log("do nothing :P");
                    }
                    else {
                        _this.setState({
                            userProgression: this.state.userProgression - 1,
                        })
                    }
                }}>{"<"}</button>
                <button  className="forwardArrow" onClick={()=>{
                    // if statement to force users to answer
                    _this.setState({
                        userProgression: this.state.userProgression + 1
                    })
                }}> {buttonButton + ">"} </button>
            </div>
        )
    }

    render() {
        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }

        return (
            <div className="page quiz-container">
                <div>
                    <h2>{this.state.quizName}</h2>
                    { this.renderQuiz() }
                </div>
            </div>
        )
    }
}

export default SingleQuiz