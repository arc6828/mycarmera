import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
//import { Camera, Permissions } from 'expo';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera'; 
import ToolbarScreen from './ToolbarScreen';
import Gallery from './GalleryScreen';
import * as FileSystem from 'expo-file-system';

import styles from './styles';
//expo install expo-permissions
//expo install expo-camera

//yarn add @expo/vector-icons
//npm install react-native-easy-grid --save


export default class CameraScreen extends React.Component {
    camera = null;

    state = {
        captures: [],
        // setting flash to be turned off by default
        flashMode: Camera.Constants.FlashMode.off,
        capturing: null,
        // start the back camera by default
        cameraType: Camera.Constants.Type.back,
        hasCameraPermission: null,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] });

        var filename = photoData.uri.split("/").pop();
        console.log("PHOTO", photoData,filename);
        
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'images/')
        await FileSystem.moveAsync({
            from: photoData.uri,
            to: FileSystem.documentDirectory + 'images/'+filename
        });
    };

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };   


    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };

    render() {
        
        //const { hasCameraPermission} = this.state;
        //const { hasCameraPermission, flashMode, cameraType, capturing } = this.state;
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <React.Fragment>
                <View>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />              
                </View>
                {captures.length > 0 && <Gallery captures={captures}/>}
                <ToolbarScreen 
                    capturing={capturing}
                    flashMode={flashMode}
                    cameraType={cameraType}
                    setFlashMode={this.setFlashMode}
                    setCameraType={this.setCameraType}
                    onCaptureIn={this.handleCaptureIn}
                    onCaptureOut={this.handleCaptureOut}
                    onLongCapture={this.handleLongCapture}
                    onShortCapture={this.handleShortCapture}                
                />
            </React.Fragment>
        );
    };
}