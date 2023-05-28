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
  SectionList,
} from 'react-native';
import RNFS from 'react-native-fs';

import React, {useState} from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Video from 'react-native-video';
import {Dirs, FileSystem} from 'react-native-file-access';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';
const ImageProject = () => {
  const [pastedURL, setPastedURL] = useState('');
  //https://getsamplefiles.com/download/zip/sample-3.zip
  const [dataVideo, setDataVideo] = useState<any>([]);
  const [dataImg, setDataImg] = useState<any>([]);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [progess, setProgess] = useState<number>(0);
  const DATA = [
    {
      title: 'Videos',
      data: dataVideo,
    },
    {
      title: 'Photos',
      data: dataImg,
    },
  ];

  const test = async () => {
    const result = await unzip(
      `/storage/emulated/0/Download/file1.zip`,
      RNFS.DownloadDirectoryPath,
    );
    console.log(result);
  };
  subscribe(({progress, filePath}) => {
    // the filePath is always empty on iOS for zipping.
    // console.log(`progress: ${progress}\nprocessed at: ${filePath}`);
    setProgess(progress);
  });
  const requestStoragePermission = async () => {
    const date = new Date();
    RNFS.downloadFile({
      fromUrl: pastedURL,
      toFile: `/storage/emulated/0/Download/file1.zip`,
    })
      .promise.then(res => {
        console.log('File downloaded at: ');
      })
      .catch(error => {
        console.log('Error while downloading: ', error);
      });
  };
  const handleShowImages = async () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
      .then(r => {
        setDataVideo([]);
        setDataImg(r.edges);
        setIsShow(true);
      })
      .catch(err => {
        console.log(err);
      });
  };
  const handleShowVideos = async () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Videos',
    })
      .then(r => {
        setDataVideo(r.edges);
        setDataImg([]);
        setIsShow(false);
      })
      .catch(err => {
        console.log(err);
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
    <View style={{flex: 1, alignItems: 'center'}}>
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
      <View style={{flexDirection: 'row', gap: 20, marginTop: 20}}>
        {/* <Button title="Get Videos" onPress={() => handleShowVideos()}></Button>
        <Button title="Get Photo" onPress={() => handleShowImages()}></Button> */}

        <Button title="Un zip" onPress={() => test()}></Button>
      </View>
      <View>
        <Text>Giải nén được {Math.floor(progess * 100)} %</Text>
      </View>
      {/* <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => {
          return (
            <View style={{marginTop: 20, alignItems: 'center'}}>
              {item.node.type === 'video/mp4' ? (
                <View style={{}}>
                  <Video
                    source={{
                      uri: item.node.image.uri,
                    }}
                    resizeMode="cover"
                    style={{flex: 1, width: 400}}
                  />
                  <Text style={{fontSize: 12}}>
                    {handleConvertTimestamp(item.node.timestamp)}
                  </Text>
                </View>
              ) : (
                <View>
                  <Image
                    source={{
                      uri: item.node.image.uri,
                    }}
                    style={{width: 100, height: 100}}></Image>
                  <Text style={{fontSize: 12}}>
                    {handleConvertTimestamp(item.node.timestamp)}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
        renderSectionHeader={({section: {title}}) => (
          <Text
            style={{
              fontSize: 32,
              backgroundColor: '#fff',
            }}>
            {title}
          </Text>
        )}
      /> */}
    </View>
  );
};

export default ImageProject;
