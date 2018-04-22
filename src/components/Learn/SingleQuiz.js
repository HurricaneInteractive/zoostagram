
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

        _this.setState({
            userID: firebase.auth().currentUser.uid
        });
        // get current users information/stats
        databaseRef.ref(`users/${firebase.auth().currentUser.uid}`).once('value').then(function(snapshot){
            console.log("all user data below: ");
            let userDataHere = snapshot.val();
            console.log(snapshot.val() );
            _this.setState({
                allUserData: userDataHere
            })
        })
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
        console.log("loop coming");

        const totalQuestionsAsked = this.state.correctAnswers.length;
        // console.log(this.state.correctAnswers)
        let updatedPoints = 0;

        for (let i = 0; i < totalQuestionsAsked; i++) {
            console.log("correctAnswer from i " + this.state.correctAnswers[i]);
            console.log("userAnswer from i " + this.state.userAnswers[i]);
            console.log("just the - " + i);

            let compareUser = JSON.stringify(this.state.userAnswers[i]);
            let compareCorrect = JSON.stringify(this.state.correctAnswers[i]);

            if (compareUser === compareCorrect) {
                console.log("updated points value = " + updatedPoints)
                updatedPoints = updatedPoints + 1;
            }
            else {
                console.log("no points today m8")
            }
        }
        return updatedPoints
    }

    // checkWhoIsHigher(old, new) {

    //     if (old > new ) {
    //         return old;
    //     }
    //     else {
    //         return new;
    //     }
    // }

    pushTheData(pointsToPush) {
        console.log("inside the push");
        let quizoMizzo = this.state.quizName;
        let uid = this.state.userID;

        let oldData = this.state.allUserData;

        // adds quiz for the first time
        if (typeof oldData.quiz_attempts === undefined) {
            console.log("specific quiz name doesnt exist");
            
            let pushThisQuizAttempts = databaseRef.ref().child(`users/${uid}/`);
            pushThisQuizAttempts.update({
                quiz_attempts: {},
                points: 0
            })
        }
        else {
            console.log(oldData.quiz_attempts[quizoMizzo].hs);
            console.log("else of quiz attempts - does it exist?")
        }

        // checks if current points exist
        // then checks if new points are larger than the old ones
        let quizSpecificPointsToUpdate = 0;
        if (oldData.quiz_attempts[quizoMizzo].hs === undefined) {
                quizSpecificPointsToUpdate = pointsToPush;
        }
        else {
            if (oldData.quiz_attempts[quizoMizzo].hs < pointsToPush) {
                quizSpecificPointsToUpdate = pointsToPush;
            }
            else {
                quizSpecificPointsToUpdate = oldData.quiz_attempts[quizoMizzo].hs;
            }
        }

        let updatedPoints = oldData.points - oldData.quiz_attempts[quizoMizzo].hs + quizSpecificPointsToUpdate;

        let updateThisData = {
            points: updatedPoints,
            quiz_attempts: quizoMizzo,
            hs: quizSpecificPointsToUpdate
        }

        let pushThisQuizPoints = databaseRef.ref().child(`users/${uid}/`);

        console.log(pushThisQuizPoints);
        // push user data to DB (without overriding and deleting the whole user DB)
        let pushThisQuizAttempts = databaseRef.ref().child(`users/${uid}/quiz_attempts/`);
        return (
            pushThisQuizAttempts.update({
                [quizoMizzo] : {
                    hs: updateThisData.hs
                }
            }),
            pushThisQuizPoints.update({
                points: updateThisData.points
            })
        )
            
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
            console.log("before the push");
            this.pushTheData(pointsToPush);
            console.log("after the push");

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