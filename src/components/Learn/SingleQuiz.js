
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
            answersCorrect: 0,
            userAnswers: [],
            userProgression: 0,
            optionState: false
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

    clickHandler(question) {
        this.setState({
            optionState: !this.state.optionState
        })

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

    renderQuiz() {
        console.log(this.state);
        const _this = this;

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        
        console.log(keys);
        console.log(this.state.userProgression);
        console.log(this.state.userAnswers);

        let quizProgression = quiz[keys[this.state.userProgression]];

        console.log('Progression', quizProgression);
        console.log(quizProgression);
        // adjust the value of 3 to fit with how many questions are in the quiz
        let progressionPercentage = this.state.userProgression / 3 * 100;

            return (
                <div>
                    <div className="progressionBar">
                        <div style={{ width: `${"" + progressionPercentage + "%"}`}}></div>
                    </div>
                    
                    {/* get thes current question*/}
                    <h2>{ quizProgression.question }</h2>
                    {
                        // onClick progression goes back a question
                        <button onClick={()=>{
                            _this.setState({
                                userProgression: this.state.userProgression - 1
                            })
                        }}
                        >{"< back"}</button>
                    }
                    <ul>
                        
                        {
                            
                            
                            quizProgression.options.map((question, i) => {
                                let selectedQuestion = question;
                                let questionAnswerClass = "quizOption";
                                console.log(selectedQuestion)

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
                    {
                        // onClick progression goes forward a question
                        <button onClick={()=>{
                            _this.setState({
                                userProgression: this.state.userProgression + 1
                            })
                        }}
                        >{"forward >"}</button>
                    }
                </div>
            )
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