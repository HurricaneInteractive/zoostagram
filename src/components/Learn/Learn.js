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

class LearnModal extends React.Component {
    render() {
        console.log(this.props)
        return (
            <div className="learn-modal">
                <div>
                    <div>
                        <h1>{this.props.itemId}</h1>
                        <div className="quiz-info">
                            <div>
                                <h2>What do you know about {this.props.itemName}?</h2>
                                <p>your best score {this.props.userBestScore}</p>
                            </div>
                            <Link to={`/doquiz/${this.props.itemName}`}></Link>
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    }
}

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
            activeUserBestScore: null
        }

        this.renderQuiz = this.renderQuizTitles.bind(this)
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

    quizModal(key, item) {
        console.log(item);
        console.log(key);
        console.log(this.state.allUserData.quiz_attempts[`${key}`].hs);
        this.setState({
            openDeleteModal: true,
            activeItemName: key,
            activeItemId: item,
            activeUserBestScore: this.state.allUserData.quiz_attempts[`${key}`].hs
        })
    }

    renderQuizTitles() {
        // console.log(this.state.allLearnData);

        let quiz = this.state.allLearnData;
        let keysTitle = Object.keys(quiz);
        // console.log(keysTitle);

        // console.log(quiz[keys[0]].question);

        let quizTiles = keysTitle.map( (key, item) => {
            // console.log(item)
            // console.log(key)
            return (<li key={item} onClick={() => this.quizModal(key, item)}>{key}</li>
        )});


        return (
            <div>
                <ul>
                    { quizTiles }
                </ul>
                <LearnModal isOpen={this.state.openDeleteModal}  
                    itemId={this.state.activeItemId}
                    itemName={this.state.activeItemName}
                    userBestScore={this.state.activeUserBestScore}
                />
            </div>
        )
    }

    render() {
        if (this.state.allLearnData === null) {
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
