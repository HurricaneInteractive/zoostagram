import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from '../firebase'

import { DefaultUserImage, SettingsIcon } from './Icons'
import { Logout } from './Profile'
import Loading from './Loading'

const storageRef = firebase.storage().ref();

export default class ProfileImage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.user ? this.props.user : null,
            settingsOpen: false,
            popupOpen: false,
            saving: false
        }

        this.toggleSettings = this.toggleSettings.bind(this)
        this.togglePopup = this.togglePopup.bind(this)
        this.uploadFile = this.uploadFile.bind(this)
        this.dataURItoBlob = this.dataURItoBlob.bind(this)
    }

    componentDidMount() {
        if (this.state.user === null) {
            this.setState({
                user: firebase.auth().currentUser
            })
        }
    }

    /**
     * Toggles the state of the settings menu
     * 
     * @param {any} e Anchor Event Object
     * @memberof JourneyTitle
     */
    toggleSettings(e) {
        e.preventDefault();
        this.setState({
            settingsOpen: !this.state.settingsOpen
        })
    }

    togglePopup(e) {
        e.preventDefault();
        this.setState({
            popupOpen: !this.state.popupOpen
        })
    }

    dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to an ArrayBuffer
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var _ia = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }
    
        var dataView = new DataView(arrayBuffer);
        var blob = new Blob([dataView], { type: mimeString });
        return blob;
    }

    uploadFile(e) {
        e.preventDefault();
        const _this = this;
        let file = this.fileInput.files[0],
            fileReader = new FileReader();

        if (typeof file === 'undefined' || file === null) {
            console.error('NO FILE');
            return false;
        }

        fileReader.onload = (e) => {
            let image = this.dataURItoBlob(e.target.result),
                fileType = file.type,
                referencePath = `profiles/${this.state.user.uid}/profile.${fileType.replace('image/', '')}`,
                metadata = {
                    cacheControl: 'public,max-age=31536000',
                    contentType: fileType
                };

            let uploadTask = storageRef.child(referencePath).put(image, metadata);

            this.setState({
                saving: true
            })

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
                // Processing
            }, (err) => {
                console.error(err.message)
            }, () => {
                let profileURL = uploadTask.snapshot.downloadURL;
                _this.state.user.updateProfile({
                    photoURL: profileURL
                }).then(() => {
                    _this.setState({
                        user: firebase.auth().currentUser,
                        saving: false,
                        popupOpen: false,
                        settingsOpen: false
                    })
                })
            })
        }
        fileReader.readAsDataURL(file);
    }

    render() {
        return (
            <div className="profile-image">
                { this.state.saving ? <Loading fullscreen={true} /> : '' }
                <Link to="/profile" className="image-wrapper">
                    {
                        this.state.user === null || this.state.user.photoURL === null ? (
                            <DefaultUserImage />
                        ) : (
                            <div className="image" style={{ backgroundImage: `url(${this.state.user.photoURL})` }} />
                        )
                    }
                </Link>
                    {
                        this.props.editable ? (
                            <div className="settings-dropdown">
                                <a onClick={ (e) => this.toggleSettings(e) } className="trigger"><SettingsIcon /></a>
                                <ul className={ this.state.settingsOpen === true ? 'open' : '' }>
                                    <li><a onClick={ (e) => this.togglePopup(e) }>Upload</a></li>
                                    <li><Logout /></li>
                                </ul>
                            </div>
                        ) : ('')
                    }
                    {
                        this.state.popupOpen ? (
                            <div className="popup-dialogue">
                                <div className="dialogue-inner">
                                    <form className="upload-image-form" encType="multipart/form-data" onSubmit={ (e) => this.uploadFile(e) }>
                                        <label>
                                            Upload Image
                                            <input type="file" id="profile_image" name="profile_image" accept="image/*" ref={input => {this.fileInput = input}} />
                                        </label>

                                        <button type="submit" className="btn">Upload</button>
                                    </form>
                                    <button className="btn btn-outline" onClick={ (e) => this.togglePopup(e) }>Cancel</button>
                                </div>
                            </div>
                        ) : ('')
                    }
            </div>
        )
    }
}