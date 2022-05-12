import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ImageBackground,
    Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import default_img from '../assets/default-image.jpeg';
import { ActivityIndicator } from 'react-native-paper';
import * as FS from 'expo-file-system';
import { ip } from './Constants'


export default function HomeScreen() {
    const navigation = useNavigation();
    const default_img_uri = Image.resolveAssetSource(default_img).uri;
    const [image, setImage] = useState(default_img_uri);
    const [filePopupMenu, setFilePopupMenu] = useState(false);
    const [imageUploadStatus, setImageUploadStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [board, setBoard] = useState({});
    const [showError, setShowError] = useState(false);

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const OPERATION_FAILURE = 'FAILURE';

    const statusRef = useRef(null);

    useEffect(() => {
        if ('pieces' in board) {
            console.log("Set State completed", board);
            setImage(default_img_uri);
            setImageUploadStatus(false);
            navigation.navigate('PromptView', board);
            setIsLoading(false);
        }
    }, [board])


    const selectFile = () => setFilePopupMenu(!filePopupMenu);
    const takePhoto = async () => {
        const res = await ImagePicker.getCameraPermissionsAsync();
        if (Platform.OS == "ios" && res.status !== 'granted') {
            const {s} = await ImagePicker.requestCameraPermissionsAsync();
            if (s.status !== 'granted') {
            alert("Features may be limited without access");
            return;
            }
        }
        const image = await ImagePicker.launchCameraAsync({
            aspect: [1, 1],
            quality: 1,
        });

        if (!image.cancelled) {
            console.log(image.height, image.width);
            
            setImage(image.uri);
            setImageUploadStatus(true);
            setFilePopupMenu(!filePopupMenu);
        }
    };

    const choosePhoto = async () => {
        const res = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (Platform.OS === "ios" && res.status !== 'granted') {
            const {s} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log(s)
            if (s.status !== 'granted') {
            alert("Features may be limited without access");
            return;
            }
        }
        let image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!image.cancelled) {
            console.log(image.height, image.width);

            setImage(image.uri);
            setImageUploadStatus(true);
            setFilePopupMenu(!filePopupMenu);
        }
    };

    const submitPressed = async () => {
        setFilePopupMenu(false);
        setIsLoading(true);
        await uploadImage();
    }

    // const ip = 'http://192.168.1.180'  // 225 for Mac, 180 for Windows

    const uploadImage = async () => {

        const content_type = 'image/jpeg'

        let response = await FS.uploadAsync(ip + ':3000/submitImage', 
                            image, {
                                headers: {
                                "content-type": content_type,
                                },
                                httpMethod: "POST",
                                uploadType: FS.FileSystemUploadType.BINARY_CONTENT,
                            });
        // console.log(response.headers);
        console.log("Image upload status: " + response.body['status']);

        if (response.body['status'] === OPERATION_FAILURE) {
            setShowError(true);
            return;
        }

        await fetch(ip + ':3000/bound', {
            method: 'GET'
        })
            .then(res => res.json())
            .then(res => {
                    console.log("Bound status: " + res['status']);
                    statusRef.current = res['status'];
                })
            .catch(err => {
                console.log("Failed to bound board.\n" + err);
                statusRef.current = res['status'];
                setIsLoading(false);
            });

        if (statusRef.current === OPERATION_FAILURE) {
            setShowError(true);
            return;
        }

        await fetch(ip + ':3000/classify', {  // .225 for Mac
            method: 'GET'
        })
            .then(response => response.json())
            .then(res => {
                if (res['status'] === OPERATION_FAILURE) {
                    console.log("Failed to classify pieces");
                    setShowError(true);
                    setIsLoading(false);
                } else {
                    setBoard(res['pieces']);
                }
            })
            .catch(err => {
                console.log("Failed to retrieve moves.\n" + err);
                setShowError(true);
                setIsLoading(false);
            });
    };

    if (filePopupMenu) {
        var menu = (
            <>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={choosePhoto}>
            <Text style={styles.buttonText}>Choose From Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={selectFile}>
            <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            </>
        )
    } else {
        var menu = (
            <TouchableOpacity onPress={selectFile} style={styles.button}>
            <Text style={styles.buttonText}>Select File</Text>
            </TouchableOpacity>
        )
    }

    if (imageUploadStatus && !filePopupMenu) {
        var uploadButton = (
            <>
            <TouchableOpacity onPress={submitPressed} style={styles.buttonSpecial}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            </>
        )
    }

    const errorPrompt = (
        <View style={[styles.centerContents, {marginTop: 10}]}>
            <Text style={{color: 'red', fontSize: 16, textAlign: 'center', fontWeight: 'bold'}} >Error:</Text>
            <Text style={{color: 'red', fontSize: 16, textAlign: 'center', marginTop: -10}}>{'\nFailed to upload image,\nplease try again.'}</Text>
        </View>
    );

    return (
        <View style={[styles.container, {flexDirection: "column", justifyContent: "center", width: windowWidth, height: windowHeight}]}>
            {isLoading ? <ActivityIndicator animating={isLoading} size='large' color={'#3740ff'} style={{position: 'absolute', width: windowWidth / 2, height: windowHeight / 1.5, zIndex: 100}} /> : <></>}
            <View style={{width: '100%', height: '88%'}} >
                <View style={[styles.centerContents, {height: '18%'}]} >
                    <Image source={require('../assets/bq.png')} />
                    <Text style={{fontSize: 30, marginTop: 10, fontWeight: '300', fontFamily: 'Times New Roman'}}>CARTER'S GAMBIT</Text>
                </View>
                <View style={[styles.centerContents, {height: '60%'}]} >
                    <Text style={{fontSize: 16}} >Upload Status</Text>
                    <Image source={imageUploadStatus ? require('../assets/checkmark.png') : require('../assets/red_x.png')} style={{height: 60, width: 60, marginTop: 10}} />
                    {showError ? errorPrompt : null}
                </View>
                <View  style={[styles.centerContents, {height: '22%', justifyContent: 'flex-end'}]} >
                    {menu}
                    {uploadButton}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
    },
  
    button: {
      width: 250,
      height: 60,
      backgroundColor: '#3740ff',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      marginBottom:12,
    },
  
    buttonSpecial: {
      width: 250,
      height: 60,
      backgroundColor: '#000',
      color: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      marginBottom:12,
    },
  
    buttonText: {
      textAlign: 'center',
      fontSize: 15,
      color: '#fff',
    },
  
    centerContents: {
      justifyContent: 'center',
      alignItems: 'center', 
    }
  
  });
  