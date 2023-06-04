import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
  Button,
  Image,
  SectionList,
} from 'react-native';
import RNFS from 'react-native-fs';
import {PermissionsAndroid} from 'react-native';
import Permissions from 'react-native-permissions';
import React, {useState} from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Video from 'react-native-video';
import {Dirs, FileSystem} from 'react-native-file-access';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';
const ImageProject = () => {
  const [pastedURL, setPastedURL] = useState(
    'https://joylist.s3.us-east-2.amazonaws.com/profile/5f229e9cfa3dc8542f815cb9.HEIC',
  );
  //
  const [dataVideo, setDataVideo] = useState<any>([]);
  const [dataImg, setDataImg] = useState<any>([]);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [progess, setProgess] = useState<number>(0);
  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Quyền truy cập ảnh',
          message: 'Ứng dụng cần quyền truy cập vào thư viện ảnh để lưu ảnh.',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Đã cấp quyền truy cập vào thư viện ảnh');
        // Tiếp tục xử lý sau khi đã có quyền
      } else {
        console.log('Quyền truy cập vào thư viện ảnh bị từ chối');
        // Xử lý khi quyền bị từ chối
      }
    } catch (error) {
      console.log('Lỗi yêu cầu quyền truy cập vào thư viện ảnh:', error);
    }
  };
  // requestStoragePermission();
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
  const getFile = (path: string) => {
    const index = path.lastIndexOf('.');
    return path.slice(index);
  };
  const getZipFile = (path: string): boolean => {
    if (path.includes('.zip')) return true;
    return false;
  };
  const saveImageToCameraRoll = (imageUri: string) => {
    CameraRoll.save(imageUri)
      .then(() => {
        console.log('Ảnh đã được lưu vào Camera Roll!');
      })
      .catch(error => {
        console.log('Lỗi khi lưu ảnh vào Camera Roll:', error);
      });
  };

  const test = async () => {
    const arrResult = await RNFS.readDir('/storage/emulated/0/Download/');
    arrResult.forEach(async item => {
      if (getZipFile(item.path)) {
        const result = await unzip(item.path, RNFS.DownloadDirectoryPath);
      }
    });
  };
  subscribe(({progress, filePath}) => {
    setProgess(progress);
  });
  const downloadFile = async () => {
    const date = new Date();
    console.log(getFile(pastedURL));
    const toFile = `/storage/emulated/0/Download/${date.getTime()}${getFile(
      pastedURL,
    )}`;
    RNFS.downloadFile({
      fromUrl: pastedURL,
      toFile: toFile,
    })
      .promise.then(res => {
        saveImageToCameraRoll(toFile);
        console.log('File downloaded at: /storage/emulated/0/Download/');
        Alert.alert('file download is successed');
      })
      .catch(error => {
        console.log('Error while downloading: ', error);
        Alert.alert(error);
      });
  };
  const handleShowImages = async () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
      groupTypes: 'SavedPhotos',
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
            downloadFile();
          } else {
            Alert.alert('Please Add URL');
          }
        }}>
        <Text style={{color: '#fff'}}>Download File</Text>
      </TouchableOpacity>
      <View style={{flexDirection: 'row', gap: 20, marginTop: 20}}>
        <Button title="Get Videos" onPress={() => handleShowVideos()}></Button>
        <Button title="Get Photo" onPress={() => handleShowImages()}></Button>
        <Button title="Un zip" onPress={() => test()}></Button>
      </View>
      <View>
        <Text>Giải nén được {Math.floor(progess * 100)} %</Text>
      </View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => {
          console.log(item.node);
          return (
            <>
              {(item.node.group_name === 'Movies' ||
                item.node.group_name === 'Pictures') && (
                <View style={{alignItems: 'center'}}>
                  {item.node.type === 'video/mp4' ? (
                    <View style={{}}>
                      <Video
                        source={{
                          uri: item.node.image.uri,
                        }}
                        resizeMode="contain"
                        style={{flex: 1, width: 400, height: 200}}
                      />
                      <Text style={{fontSize: 12, position: 'absolute'}}>
                        {handleConvertTimestamp(
                          item.node.modificationTimestamp,
                        )}
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
                        {handleConvertTimestamp(
                          item.node.modificationTimestamp,
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
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
      />
    </View>
  );
};

export default ImageProject;
