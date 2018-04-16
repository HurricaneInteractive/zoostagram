
import React from 'react'
// import { Link } from 'react-router-dom'
import firebase from '../firebase'

import Loading from '../Global/Loading'

const databaseRef = firebase.database();

class SingleQuiz extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allLearnData: null
        }

       this.renderQuiz = this.renderQuiz.bind(this)
    }

    componentDidMount() {
        const _this = this;

        databaseRef.ref(`quiz/${this.props.match.params.id}`).once('value').then(function(snapshot) {
            let databaseState = snapshot.val();
            console.log(databaseState);   
            _this.setState({
                allLearnData: databaseState
            });
        });
    }

    renderQuiz() {
        console.log(this.state.allLearnData);

        let quiz = this.state.allLearnData;
        let keys = Object.keys(quiz);
        console.log(keys);

        console.log(quiz[keys[0]].question);

        let allQuiz = Object.keys(quiz).map((key, i) => {
            return (
                <div key={i}>
                    <h1>hola</h1>
                    <li>
                        { quiz[key].question }
                    </li>
                </div>
                
            )
        })

        return allQuiz;
    }

    render() {

        if (this.state.allLearnData === null) {
            return <Loading fullscreen={true} />
        }
      
        return (
            <div className="quiz-container">
                <div>
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