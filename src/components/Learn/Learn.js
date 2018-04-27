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

import quizShapeOne from '../../images/quizshape-svg-one.svg'
// eslint-disable-next-line
import quizShapeTwo from '../../images/quizshape-svg-two.svg'
// eslint-disable-next-line
import quizShapeThree from '../../images/quizshape-svg-three.svg'
// eslint-disable-next-line
import quizShapeFour from '../../images/quizshape-svg-four.svg'
// eslint-disable-next-line
import quizShapeFive from '../../images/quizshape-svg-five.svg'

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
            firstAttempt: true
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
        console.log(this.state);
        console.log(this.state.allUserData);

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
        console.log(quizClassName);
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
        console.log(keysTitle);

        // console.log(quiz[keys[0]].question);
        

        let quizTiles = keysTitle.map( (key, item) => {
            let quizzoClasso = this.quizStateChecker(key, item);
            console.log(quizzoClasso);
            return (<li key={item} className={quizzoClasso}
                onClick={() => this.quizModal(key, item)}>
                    <div className={"quizNumber"}>{item + 1}</div>
                    <div className={"quizSvgBackground"}><img src={quizShapeOne} alt={quizShapeOne}/></div>
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
