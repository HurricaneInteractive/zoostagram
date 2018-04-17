
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

        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            // console.log(databaseState);
            _this.setState({
                allLearnData: databaseState
            });
        });

        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let quizNameYo = snapshot.key;
            // console.log(quizNameYo);
            _this.setState({
                quizName: quizNameYo
            });
        });

    }
    /* 
        make the questions go through as a slideshow
        create onClick event that goes to the next question
        keep users data until they have submitted - not like its currently adding to the score straight away
            (just incase they go back and change their answers)
    */

    clickHandler() {
        this.setState({
            optionState: !this.state.optionState
        })
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

            return (
                <div>
                    <h2>{ quizProgression.question }</h2>
                    {
                        <button onClick={()=>{
                            _this.setState({
                                userProgression: this.state.userProgression - 1
                            })
                        }}
                        >{"< back"}</button>
                    }
                    <ul>
                        {
                            quizProgression.options.map(i => {        
                                let buttonClass = ['button'];
                                if (this.state.optionState) {
                                    buttonClass.push('toggle')
                                }
                                console.log('answers', this.state.userProgression);
                                console.log('i', i);
                                let clickedAnswer = "";
                                let questionClass = "toggle"
                                return (
                                    <li key={i}
                                    // {
                                    //     if (clickedAnswer) 'active' {
                                    //         questionClass = "toggle"
                                    //     }
                                    // }
                                    // if statement should match the key that was clicked and give it an active class
                                        
                                    className={(questionClass)}
                                    // onClick={
                                    //     this.clickHandler.bind(this)
                                    // }
                                    onClick={()=>{
                                        this.clickHandler.bind(this)
                                        clickedAnswer = i
                                        console.log(clickedAnswer)
                                    }}
                                    /* if clicked - give active class */
                                    >
                                        {console.log('i = ', i)}
                                        {i}
                                    </li>
                                    
                                )
                            })
                        }
                    </ul>
                    {
                        <button onClick={()=>{
                            _this.setState({
                                userProgression: this.state.userProgression + 1
                            })
                        }}
                        >{"forward >"}</button>
                    }
                </div>
            )

        // let quizProgression = Object.keys(quiz[this.state.userProgression]) ((key, i) => {
        //     let quizData = quiz[key];
        //     console.log(key);
        //     console.log(i);
        //     console.log(quizData);
        //     console.log(quizProgression);
            
        //     return (
        //         <div key={i}>
        //             <h2>{ quizData.question }</h2>
        //             <ul>
        //                 {
        //                     quizData.options.map(i => {              
        //                         return (
        //                             <li key={i} onClick={()=>{
        //                                     _this.setState({
        //                                         userProgression: this.state.userProgression + 1
        //                                     })
        //                                 }}>
        //                                 {console.log(i)}
        //                                 {i}
        //                             </li>
                                    
        //                         )
        //                     })
        //                 }
        //             </ul>
        //         </div>
        //     )
        // })

        // return quizProgression;
        
        


        // let allQuiz = Object.keys(quiz).map((key, i) => {
        //     let quizData = quiz[key];
            
        //     console.log(allQuiz);

        //     let correctAnswer = quizData.answer;
        //     console.log(correctAnswer);
        //     return (
        //         <div key={i}>
        //             <h2>{ quizData.question }</h2>
        //             <ul>
        //                 {
        //                     quizData.options.map(i => {              
        //                         return (
        //                             <li key={i} onClick={()=>{
        //                                     let userAnswer = i;
        //                                     userAnswer === quizData.answer &&
        //                                     _this.setState({
        //                                         answersCorrect: this.state.answersCorrect + 1
        //                                     })
        //                                 }}>
        //                                 {console.log(i)}
        //                                 {i}
        //                             </li>
                                    
        //                         )
        //                     })
        //                 }
        //             </ul>
        //         </div>
        //     )
        // })

        // return allQuiz;
    //}
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