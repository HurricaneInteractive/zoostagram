/**
 * @requires BETTER VARIABLE NAMES PLEASE!
 */
import React from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'
import PageTitle from '../Global/PageTitle';

import Enclosures from '../config/enclosures';

const databaseRef = firebase.database();
/**
 * Single Quiz page Component
 * 
 * @class SingleQuiz
 * @extends {React.Component}
 */
class SingleQuiz extends React.Component {
    /**
     * Creates an instance of SingleQuiz.
     * 
     * @param {any} props Props passed to the Component
     * @memberof SingleQuiz
     */
    constructor(props) {
        super(props);
        this.state = {
            userID: this.props.authUser.uid,
            allUserData: null,
            allLearnData: null,
            quizName: null,
            userAnswers: [],
            correctAnswers: [],
            userProgression: 0,
            userPercentage: 50,
            updatedUserData: null
        }

       this.renderQuiz = this.renderQuiz.bind(this)
       this.pushTheData = this.pushTheData.bind(this)
       this.updateHighScore = this.updateHighScore.bind(this)
       this.changeProgression = this.changeProgression.bind(this)
    }

    /**
     * React Function - See React Lifecycle
     * Gets the quiz data & user data from the DB
     * 
     * @memberof SingleQuiz
     */
    componentDidMount() {
        const _this = this;

        // gets quiz information based on the url params
        databaseRef.ref(`quiz/${this.props.routerProps.match.params.id}`).once('value').then((snapshot) => {
            _this.setState({
                allLearnData: snapshot.val(),
                quizName: snapshot.key
            });
        });

        // get current users information/stats
        databaseRef.ref(`users/${this.state.userID}`).once('value').then((snapshot) => {
            _this.setState({
                allUserData: snapshot.val()
            })
        });
    }

    /**
     * Checks if the option has been selected and updates the userAnswers state
     * 
     * @param {string} question current question
     * @param {string} answer correct answer
     * @param {object} quizProgression current quiz object
     * @memberof SingleQuiz
     */
    clickHandler(question, answer, quizProgression) {
        let { userAnswers, userProgression, correctAnswers } = this.state,
            newUserAnswers = userAnswers,
            newCorrectAnswers = correctAnswers;
        
        if (typeof userAnswers[userProgression] === 'undefined') {
            newUserAnswers.push(question);
            newCorrectAnswers.push(answer);
        }
        else {
            newUserAnswers[userProgression] = question;
            newCorrectAnswers[userProgression] = answer;
        }

        this.setState({
            userAnswers: newUserAnswers,
            correctAnswers: newCorrectAnswers
        })
    }

    /**
     * Checks if the user has answered the quiz correctly
     * 
     * @returns updatedPoints
     * @memberof SingleQuiz
     */
    checkThemAnswers() {
        const totalQuestionsAsked = this.state.correctAnswers.length;
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
    updateHighScore(points, currentHighScore) {
        const { userID, quizName, allUserData } = this.state;
        const quizAttemptsRef = firebase.database().ref(`users/${userID}/quiz_attempts/${quizName}`);
        const userPoints = firebase.database().ref(`users/${userID}`);

        let updateData = {
            hs: points
        }

        let pointsToUpdate = {
            points: allUserData.points - currentHighScore + points
        }

        userPoints.update(pointsToUpdate)
            .then(() => {
                // console.log('successfully updated total points');
            }).catch((err) => {
                console.error(err.message);
            })

        quizAttemptsRef.update(updateData)
            .then(() => {
                // console.log('Successfully Added');allUserData.quiz_number_attempts
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
            this.updateHighScore(pointsToPush, 0);
        }
        else {
            if (typeof allUserData.quiz_attempts[quizName] === 'undefined') {
                this.updateHighScore(pointsToPush, 0);
            }
            else {
                if (typeof allUserData.quiz_attempts[quizName].hs === 'undefined') {
                    this.updateHighScore(pointsToPush, 0);
                }
                else {
                    let currentHighScore = allUserData.quiz_attempts[quizName].hs;
                    if (currentHighScore < pointsToPush) {
                        this.updateHighScore(pointsToPush, currentHighScore);
                    }
                }
            }
        }

        // quiz achievements here

        // quiz attempts

        // quiz 100%
    }
    updateAchievementProgress(quizName, keyLength, userScore) {
        const { userID, allUserData } = this.state;
        const currentQuizName = quizName;
        const userPoints = firebase.database().ref(`users/${userID}`);

        let quizAttempt = 0;
        let quizCompleted = 0;
        if (typeof allUserData.quiz_number_attempts !== "undefined") {
            quizAttempt = allUserData.quiz_number_attempts;
        }
        if (typeof allUserData.quiz_number_attempts !== "undefined") {
            quizCompleted = allUserData.quiz_number_completed;
        }

        console.log("key Length: " + keyLength);
        console.log("current user score: " + userScore);
        console.log("current quiz_number_completd: " + this.state.allUserData.quiz_number_completed);
        if (userScore === keyLength) {
            console.log("quiz 100% checker '1st if'");
            if (typeof allUserData.quiz_attempts[currentQuizName] === "undefined") {
                quizCompleted = allUserData.quiz_number_completed;
            }
            else if (allUserData.quiz_attempts[currentQuizName].hs !== userScore) {
                quizCompleted = allUserData.quiz_number_completed;
                console.log("quiz 100% checker '2nd if'");
            }
            else {
                quizCompleted = allUserData.quiz_number_completed + 1;
                console.log("quiz 100% checker 'else'");
            }
        }

        /*
        if currentscore = keylength
            if currentscore = highscore {
                break
            }
            else {
                totalCompleted = totalcompleted + 1
            }

        */

        let pointsToUpdate = {
            quiz_number_attempts: quizAttempt + 1,
            quiz_number_completed: quizCompleted
        }

        userPoints.update(pointsToUpdate)
            .then(() => {
                console.log('successfully updated total points');
            }).catch((err) => {
                console.error(err.message);
            })
        console.log("Achievements updated");
        console.log("current quiz_number_completd (After update): " + this.state.allUserData.quiz_number_completed);

    }

    /**
     * Resets the Quiz
     * 
     * @memberof SingleQuiz
     */
    resetQuiz() {
        this.setState({
            userAnswers: [],
            correctAnswers: [],
            userProgression: 0,
            userPercentage: 0
        })
    }

    /**
     * Changes the Progression of the Quiz
     * 
     * @param {object} e Button Event Object
     * @param {int} idx Next progression step
     * @returns false IF the user is not allowed to move
     * @memberof SingleQuiz
     */
    changeProgression(e, idx) {
        e.preventDefault();
        let { userProgression, userAnswers } = this.state;
        let nextProgression = userProgression + idx;

        if (typeof userAnswers[userProgression] === 'undefined') {
            if (idx > 0) {
                return false;
            }
        }

        if (nextProgression >= 0) {
            let nextProgression = userProgression + idx;
            this.setState({
                userProgression: nextProgression
            })
        }
    }

    /**
     * Renders either the quiz questions or the Completed page
     * 
     * @returns DOM
     * @memberof SingleQuiz
     */
    renderQuiz() {
        let quiz = this.state.allLearnData,
            { userProgression, userAnswers, quizName } = this.state,
            keys = Object.keys(quiz),
            keyLength = keys.length,
            quizProgression = quiz[keys[userProgression]],
            progressionPercentage = userProgression / keys.length * 100,
            updateTheScore = 0;

        if (userProgression === keyLength) {
            updateTheScore = this.checkThemAnswers();
            let pointsToPush = updateTheScore;

            let userScoreFraction = JSON.stringify(updateTheScore) + "/" + JSON.stringify(keys.length);
            let userScorePercentage = updateTheScore / keys.length * 100;
            let roundedUserScorePercentage = Math.round(userScorePercentage);

            // function here to push user score (updateTheScore) back to the DB
            this.updateAchievementProgress(quizName, keyLength, pointsToPush);
            this.pushTheData(pointsToPush);
            let animalImage = (`${quizName}`); // use this value for image
            // console.log(quizName);
            // console.log(animalImage);

            return (
                <div className="quiz-completed">
                    <div className="animal-background" style={{backgroundImage: `url(${animalImage})`}}>
                        <div className="progressionBar">
                            <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                        </div>
                        <h2>Congratulations</h2>
                        <h3>You completed The Quiz on {quizName}</h3>
                        <div>
                            <h2>{"" + roundedUserScorePercentage + "%"}</h2>
                            <h3>{userScoreFraction + " Questions Answered Correctly"}</h3>
                        </div>
                        <Link className="btn" to="/learn">Back to Quiz Map</Link>
                        <Link className="btn" to={`/doquiz/${quizName}`} onClick={ () => this.resetQuiz()}>Take The Quiz Again</Link>
                    </div>
                </div>
            )
        }

        return (
            <div className="quiz-questions-wrapper">
                <div className="progressionBar">
                    <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                </div>
                <div>
                    <p>{ "Question " + (userProgression + 1) }</p>
                </div>
                <div className="questionContainer">
                    <h2>{ quizProgression.question }</h2>
                        
                    <ul className="quizQuestions"> 
                        {
                            quizProgression.options.map((question, i) => {
                                let questionAnswerClass = "quizOption";
                                let answers = quizProgression.answer;

                                if (typeof userAnswers[userProgression] !== 'undefined') {
                                    if (userAnswers[userProgression] === question) {
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

                <button className="backArrow" onClick={ (e) => this.changeProgression(e, -1) }>Back</button>
                <button  className="forwardArrow" onClick={ (e) => this.changeProgression(e, 1) }>
                    {userProgression === keyLength - 1 ? 'Results >' : 'Next >'}
                </button>
            </div>
        )
    }

    /**
     * React Function - Renders Component Markup
     * 
     * @returns DOM
     * @memberof SingleQuiz
     */
    render() {
        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }
        let { quizName } = this.state;

        let animalImage = quizName; // use this value for image

        return (
            <div className="page quiz-container" id="individual_quiz">
                <div className="animal-background" style={{backgroundImage: `url(${Enclosures.coordinates[animalImage].img})`}}/>
                <div className="single-quiz-container">
                    <PageTitle title={this.state.quizName} back={() => this.props.routerProps.history.goBack()} />
                    { this.renderQuiz() }
                </div>
            </div>
        )
    }
}

export default SingleQuiz