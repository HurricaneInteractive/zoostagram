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

import StarImage from '../../images/quizshape-star.png'
import TickImage from '../../images/quizshape-tick.png'

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
                <div className="modal-wrapper">
                    <h1>{this.props.itemId + 1}</h1>
                    <div className="close">
                    <p onClick={ this.props.closeModalBox }>X</p>
                    </div>
                    <div className="quiz-info">
                        <div>
                            {/* AJ - Replaced _ with space & add conditional & <span> wrap */}
                            <h2>What do you know about <span>{this.props.itemName ? this.props.itemName.replace('_', ' ') : ''}</span>?</h2>
                            <p>{this.props.userBestScore}%</p>
                        </div>
                    <div className="pop-option">
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
                    viewBox="0 0 120.2 120.2">
                    <g id="shape_4_completed" transform="translate(60.104) rotate(45)">
                        <path className="st0" d="M35,0l15,0c19.3,0,35,15.7,35,35v15c0,19.3-15.7,35-35,35H35C15.7,85,0,69.3,0,50l0-15C0,15.7,15.7,0,35,0z"/>
                    </g>
                </svg>,
                <svg version="1.1" id="Layer_1" x="0px" y="0px"
                    viewBox="0 0 127.9 126.1">
                    <path id="shape_5_completed" className="st0" d="M25.1,47.1l-4.3,19.6c-5.9,27.8,20.6,51.8,47.8,43l18.9-6.1
	                c19.4-6.3,30.1-27.1,23.8-46.5c-2-6.3-5.7-11.9-10.6-16.3L86,27.3C64.9,8.2,31,19.2,25.1,47.1z"/>
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

        let userPercentageScore = userHighScore / Object.keys(this.state.allLearnData[key]).length * 100;
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
    quizStateChecker(key, item, quizLength) {
        let quizClassName = "";

        if (typeof this.state.allUserData.quiz_attempts === "undefined") {
            quizClassName = "noAttempt"
        }
        else if (typeof this.state.allUserData.quiz_attempts[key] === "undefined") {
            quizClassName = "noAttempt"
        }
        else if (this.state.allUserData.quiz_attempts[key].hs < quizLength.length) {
            quizClassName = "progress"
        }
        else if (this.state.allUserData.quiz_attempts[key].hs === quizLength.length) {
            quizClassName = "star"
        }
        else {
            quizClassName = "error"
        }
        return quizClassName
    }
    quizDisplayStateChecker(key, item, quizLength) {
        let quizDisplay = null;
        if (typeof this.state.allUserData.quiz_attempts === "undefined") {
            quizDisplay = <p>{item + 1}</p>;

        }
        else if (typeof this.state.allUserData.quiz_attempts[key] === "undefined") {
            quizDisplay = <p>{item + 1}</p>;
        }
        else if (this.state.allUserData.quiz_attempts[key].hs === quizLength.length) {
            quizDisplay = <img src={StarImage} alt="quiz shape tick"/>;
        }
        else {
            quizDisplay = <img src={TickImage} alt="quiz shape star" />;
        }
        return quizDisplay;
    }
    /**
     * 
     * 
     * @returns 
     * @memberof Learn
     */
    renderQuizTitles() {
        let quiz = this.state.allLearnData;
        let keysTitle = Object.keys(quiz);

        let quizTiles = keysTitle.map( (key, item) => {
            let quizLength = Object.keys(this.state.allLearnData[key]);

            let quizzoClasso = this.quizStateChecker(key, item, quizLength);
            let quizDisplay = this.quizDisplayStateChecker(key, item, quizLength);
            let quizQuestionNumber = item;
            if (item >= 5 && item <= 10) {
                quizQuestionNumber = item - 5
            }
            return (<li key={item} className={quizzoClasso}
                onClick={() => this.quizModal(key, item)}>
                    <div className={"quizNumber"}>{quizDisplay}</div>
                    <div className={"quizSvgBackground"}>
                        {this.state.svgImage[quizQuestionNumber]}
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
            <div className="page" id="learn">
            <PageTitle title="Learn" back={() => this.props.routerProps.history.push('/')} />
            <div className="hint">
               <p> Hint: Pay attention to notice boards at the National Zoo & Aquarium </p>
            </div>
                <div className="clouds-bg">
                    <div className="birds-bg">
                          <div className="path-bg">
                            <div className="dune-bg">
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
        </div>
        )
    }
}
