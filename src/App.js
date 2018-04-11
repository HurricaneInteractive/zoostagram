/**
 * Main JS file for the application
 */

import React, { Component } from 'react';
import './App.css';

import AppRouter from './components/Router'

class App extends Component {
    render() {
        return (
            <div>
                <AppRouter />
            </div>
        );
    }
}

export default App;
