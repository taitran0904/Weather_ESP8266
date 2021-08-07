import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  useWindowDimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import database from '@react-native-firebase/database';
import Torch from 'react-native-torch';

const App = () => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [gas, setGas] = useState(0);
  const [showText, setShowText] = useState(true);

  const [date, setDate] = useState(0);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [hours, setHours] = useState(0);
  const [min, setMin] = useState(0);
  // const [sec, setSec] = useState();

  const [data, setData] = useState([]);

  useEffect(() => {
    let secTimer = setInterval(() => {
      setDate(new Date().getDate());
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
      setHours(new Date().getHours());
      setMin(new Date().getMinutes());
      // setSec(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(secTimer);
  }, []);
  useEffect(() => {
  database()
    .ref()
    .on('value', snapshot => {
      setTemperature(snapshot.val().nhietdo);
      setHumidity(snapshot.val().doam);
      setGas(snapshot.val().gas);
    });
  }, []);

  fetch('http://192.168.1.127:8888/api/temperature', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      t: temperature,
    }),
  })
    .then(response => response.json())
    .then(data => {
      setData(parseInt(data.temperature));
    })
    .catch(error => setData(30))
    .done();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setShowText(showText => !showText);
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, []);

  function warningCall() {
    Torch.switchState(true)
  }

  function warningCall2() {
    Torch.switchState(false)
  }

  if (gas > 200)
    return (
      <View style={{flexDirection: 'column', flex: 1}}>
         {warningCall()}
        <View style={styles.warningBack}>
          <Text style={[styles.warning,]}>
            CẢNH
          </Text>
          {/* {display: showText ? 'none' : 'flex'} */}
          <Text style={[styles.warning, ]}>
            BÁO
          </Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow'}}>
          <TouchableOpacity
            style={styles.btnCall}
            onPress={() => {
              Linking.openURL('tel:');
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 15}}>
              Gọi điện
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  return (
    <View style={{width: windowWidth, height: windowHeight}}>
      {warningCall2()}
      <ImageBackground
        source={require('./assets/night2.jpg')}
        style={{
          flex: 1,
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: 20,
          }}>
          <View
            style={{
              flex: 1,
              marginTop: 0,
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <View style={styles.timeDate}>
              <Text
                style={{
                  fontSize: 30,
                  fontFamily: 'Lato-Regular',
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                {hours}:{min < 10 ? '0' + min : min}
                {/* {sec < 10 ? '0' + sec : sec} */}
              </Text>
              <Text style={{color: 'white'}}>
                {date}/{month}/{year}
              </Text>
            </View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={styles.topInfoWrapper}>
            <View>
              <Text style={styles.temparature}>{temperature}°C</Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.weatherType}></Text>
              </View>
            </View>
            <View>
              <Text style={styles.tPrediction}>
                Dự đoán nhiệt độ ngày mai là {data}°C
              </Text>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: 'rgba(255,255,255,0.7)',
              marginTop: 20,
              borderBottomWidth: 1,
            }}
          />
          <View style={styles.bottomInfoWrapper}>
            <View style={{alignItems: 'center', marginLeft: 20}}>
              <Text style={styles.infoText}>Độ ẩm</Text>
              <Text style={[styles.infoText, {fontSize: 20, paddingTop: 10}]}>
                {humidity}%
              </Text>
            </View>
            <View style={{alignItems: 'center', marginRight: 20}}>
              <Text style={styles.infoText}>GAS</Text>
              <Text style={[styles.infoText, {fontSize: 20, paddingTop: 10}]}>
                {gas}ppm
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  topInfoWrapper: {
    flex: 1,
    marginTop: 160,
    justifyContent: 'space-between',
  },
  tPrediction: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    fontWeight: 'bold',
  },
  timeDate: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  temparature: {
    color: '#fff',
    fontFamily: 'Lato-Light',
    fontSize: 85,
  },
  weatherType: {
    color: '#fff',
    fontFamily: 'Lato-Regular',
    fontWeight: 'bold',
    fontSize: 25,
    lineHeight: 34,
    marginLeft: 10,
  },
  bottomInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    fontWeight: 'bold',
  },
  infoBar: {
    width: 45,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorWrapper: {
    position: 'absolute',
    top: 140,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalDot: {
    height: 5,
    width: 5,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  warning: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'red',
  },
  warningBack: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  btnCall: {
    backgroundColor: 'red',
    height: 50,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
});

export default App;
