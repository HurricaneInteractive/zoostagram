/**
 * Placeholder Capture Component
 * 
 * Currently being used by AJ to test image capturing
 */

// eslint-disable-next-line
import React, { Component }from 'react'
// eslint-disable-next-line
import { Link, Route, Router } from 'react-router-dom'
// eslint-disable-next-line
import PropTypes from 'prop-types'
import firebase from '../firebase'

import Loading from '../Global/Loading'
import PageTitle from '../Global/PageTitle'
// eslint-disable-next-line
import QuizModal from './QuizModal'

const databaseRef = firebase.database();
/**
 * 
 * 
 * @class LearnModal
 * @extends {React.Component}
 */
class LearnModal extends React.Component {
    render() {
        return (
            <div className="learn-modal" style={this.props.isOpen ? {display: "block"} : {display: "none"} }>
                <div>
                    <div>
                        <h1>{this.props.itemId}</h1>
                        <p onClick={ this.props.closeModalBox }>X</p>
                        <div className="quiz-info">
                            <div>
                                <h2>What do you know about {this.props.itemName}?</h2>
                                <p>{this.props.userBestScore}%</p>
                            </div>
                            <Link to={`/doquiz/${this.props.itemName}`}>{this.props.firstTimeQuizAttempt ? "Start Quiz" : "Try Again"}</Link>
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    }
}
/**
 * 
 * 
 * @export
 * @class Learn
 * @extends {Component}
 */
export default class Learn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.authUser.uid,
            allLearnData: null,
            allUserData: null,
            isOpen: false,
            openDeleteModal: false,
            activeItemName: null,
            activeItemId: null,
            activeUserBestScore: null,
            firstAttempt: true,
            svgImage: [
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 90.4 90.4">
                    <g id="shape_1_completed" transform="translate(11.134) rotate(8)">
                        <path className="st0" d="M70,76l-60,0c-3.3,0-6-2.7-6-6l0-60c0-3.3,2.7-6,6-6l60,0c3.3,0,6,2.7,6,6l0,60C76,73.3,73.3,76,70,76z"/>
                    </g>
                </svg>,
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 107.6 107.6">
                    <g id="shape_2_completed" transform="matrix(0.891, -0.454, 0.454, 0.891, 0, 36.319)">
                        <path className="st0" d="M19,0l42,0c10.5,0,19,8.5,19,19v42c0,10.5-8.5,19-19,19H19C8.5,80,0,71.5,0,61l0-42C0,8.5,8.5,0,19,0z"/>
                    </g>
                </svg>,
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 93.8 93.8">
                    <g id="shape_3_completed" transform="translate(0 15.265) rotate(-11)">
                        <path className="st0" d="M30,0l20,0c16.6,0,30,13.4,30,30l0,20c0,16.6-13.4,30-30,30H30C13.4,80,0,66.6,0,50l0-20C0,13.4,13.4,0,30,0z"/>
                    </g>
                </svg>,
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 90.4 90.4">
                    <g id="shape_1_completed" transform="translate(11.134) rotate(8)">
                        <path className="st0" d="M70,76l-60,0c-3.3,0-6-2.7-6-6l0-60c0-3.3,2.7-6,6-6l60,0c3.3,0,6,2.7,6,6l0,60C76,73.3,73.3,76,70,76z"/>
                    </g>
                </svg>,
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 90.4 90.4">
                    <g id="shape_1_completed" transform="translate(11.134) rotate(8)">
                        <path className="st0" d="M70,76l-60,0c-3.3,0-6-2.7-6-6l0-60c0-3.3,2.7-6,6-6l60,0c3.3,0,6,2.7,6,6l0,60C76,73.3,73.3,76,70,76z"/>
                    </g>
                </svg>,
                
            ]
        }

        this.renderQuiz = this.renderQuizTitles.bind(this)
        this.quizStateChecker = this.quizStateChecker.bind(this)
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

        // get current users information/stats
        databaseRef.ref(`users/${this.state.userID}`).once('value').then((snapshot) => {
            _this.setState({
                allUserData: snapshot.val()
            })
        });
    }
    /**
     * 
     * 
     * @param {any} key 
     * @param {any} item 
     * @memberof Learn
     */
    quizModal(key, item) {
        console.log(item);
        console.log(key);
        // console.log(this.state.allUserData.quiz_attempts[`${key}`].hs);
        let userHighScore = 0;
        let firstTime = true;
        if (typeof this.state.allUserData.quiz_attempts === "undefined") {
            firstTime = true;
            userHighScore = 0;
        }
        else if (typeof this.state.allUserData.quiz_attempts[key] !== "undefined") {
            userHighScore = this.state.allUserData.quiz_attempts[key].hs;
            firstTime = false;
        }
        console.log(Object.keys(this.state.allLearnData[key]).length)

        let userPercentageScore = userHighScore / Object.keys(this.state.allLearnData[key]).length * 100;
        console.log(userPercentageScore);
        this.setState({
            openDeleteModal: true,
            activeItemName: key,
            activeItemId: item,
            activeUserBestScore: userPercentageScore,
            firstAttempt: firstTime
        })
    }
    /**
     * 
     * 
     * @memberof Learn
     */
    toggleModal() {
        this.setState({
            openDeleteModal: false
        })
    }
    /**
     * 
     * 
     * @param {any} key 
     * @param {any} item 
     * @returns 
     * @memberof Learn
     */
    quizStateChecker(key, item) {
        let quizClassName = "";
        // console.log(this.state);
        // console.log(this.state.allUserData);

        if (typeof this.state.allUserData.quiz_attempts === "undefined") {
            quizClassName = "noAttempt"
        }
        else if (typeof this.state.allUserData.quiz_attempts[key] === "undefined") {
            quizClassName = "noAttempt"
        }
        else if (this.state.allUserData.quiz_attempts[key].hs > this.state.allLearnData[key].length) {
            quizClassName = "progress";
        }
        else {
            quizClassName = "star"
        }
        // console.log(quizClassName);
        return quizClassName
    }
    /**
     * 
     * 
     * @returns 
     * @memberof Learn
     */
    renderQuizTitles() {
        // console.log(this.state.allLearnData);

        let quiz = this.state.allLearnData;
        let keysTitle = Object.keys(quiz);
        // console.log(keysTitle);

        // console.log(quiz[keys[0]].question);
        

        let quizTiles = keysTitle.map( (key, item) => {
            let quizzoClasso = this.quizStateChecker(key, item);
            // console.log(quizzoClasso);
            return (<li key={item} className={quizzoClasso}
                onClick={() => this.quizModal(key, item)}>
                    <div className={"quizNumber"}>{item + 1}</div>
                    <div className={"quizSvgBackground"}>
                        {this.state.svgImage[item]}
                    </div>
                </li>
        )});
        

        return (
            <div>
                <ul className="quizTiles">
                    { quizTiles }
                </ul>
                <LearnModal isOpen={this.state.openDeleteModal}  
                    itemId={this.state.activeItemId}
                    itemName={this.state.activeItemName}
                    userBestScore={this.state.activeUserBestScore}
                    closeModalBox={ () => this.toggleModal()}
                    firstTimeQuizAttempt={this.state.firstAttempt}
                    allLearnData={this.state.allLearnData}
                />
            </div>
        )
    }
    /**
     * 
     * 
     * @returns 
     * @memberof Learn
     */
    render() {
        if (this.state.allLearnData === null || this.state.allUserData === null) {
            return <Loading fullscreen={true} />
        }

        return (
            <div id="learn">
            <PageTitle title="Learn" back={() => this.props.routerProps.history.goBack()} />
               <p> Hint: Pay attention to notice boards at the National Zoo & Aquarium </p>
                <div className="dune-bg">
                    <div className="path-bg">
                        <div className="birds-bg">
                            <div className="adax-bg">
                                <div className="quiz-container">
                                    <div>
                                        { this.renderQuizTitles() }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
