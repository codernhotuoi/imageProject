import {
  View,
  Text,
  PermissionsAndroid,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
  Button,
  Image,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Video from 'react-native-video';
const ImageProject = () => {
  const [pastedURL, setPastedURL] = useState('');
  const [data, setData] = useState<any>();
  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Downloader App Storage Permission',
          message:
            'Downloader App needs access to your storage ' +
            'so you can download files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        downloadFile();
      } else {
        console.log('storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const downloadFile = () => {
    const {config, fs} = RNFetchBlob;
    const date = new Date();
    const fileDir = fs.dirs.DownloadDir;
    config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path:
          fileDir +
          '/download_' +
          Math.floor(date.getDate() + date.getSeconds() / 2),
        description: 'file download',
      },
    })
      .fetch('GET', pastedURL, {
        //some headers ..
      })
      .then(res => {
        // the temp file path
        console.log('The file saved to ', res.path());
        Alert.alert('file downloaded successfully ');
      });
  };
  // console.log(photos);
  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }
  const Gallery = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Videos',
    })
      .then(r => {
        setData(r.edges);
      })
      .catch(err => {
        //Error Loading Images
      });
  };
  const handleConvertTimestamp = (time: number) => {
    const timestamp = time;

    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedTime;
  };
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TextInput
        placeholder="enter/paste file url"
        style={{
          width: '90%',
          height: 50,
          borderWidth: 0.5,
          alignSelf: 'center',
          paddingLeft: 20,
          borderRadius: 20,
        }}
        value={pastedURL}
        onChangeText={txt => setPastedURL(txt)}
      />
      <TouchableOpacity
        style={{
          width: '90%',
          height: 50,
          borderWidth: 0.5,
          alignSelf: 'center',
          backgroundColor: 'purple',
          paddingLeft: 20,
          borderRadius: 20,
          marginTop: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          if (pastedURL !== '') {
            requestStoragePermission();
          } else {
            Alert.alert('Please Add URL');
          }
        }}>
        <Text style={{color: '#fff'}}>Download File</Text>
      </TouchableOpacity>
      <Button title="get photo" onPress={() => Gallery()}></Button>

      {/* <View style={{marginTop: 20}}>
        <FlatList
          data={data}
          renderItem={({item}) => {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Image
                  source={{
                    uri: item.node.image.uri,
                  }}
                  style={{width: 100, height: 100}}></Image>
                <View>
                  <Text style={{fontSize: 12}}>
                    {handleConvertTimestamp(item.node.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}></FlatList>
      </View> */}
      <View style={{marginTop: 20}}>
        <FlatList
          data={data}
          renderItem={({item}) => {
            console.log(item.node.image.uri);
            return (
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Video
                  source={{uri: 'background'}} // Can be a URL or a local file.
                  style={{height: 100, width: 100}}
                />
                <View>
                  <Text style={{fontSize: 12}}>
                    {handleConvertTimestamp(item.node.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}></FlatList>
      </View>
    </View>
  );
};

export default ImageProject;
