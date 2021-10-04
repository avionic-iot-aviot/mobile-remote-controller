import React, { useState } from 'react';
import { Button, View } from 'react-native';
import DevicesList from './components/DevicesList'
import RemoteController from './components/RemoteController';

import dgram from 'react-native-udp'
const socket = dgram.createSocket('udp4');
socket.bind(12346);


export default function App() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedNamespace, setSelectedNamespace] = useState(null);

  if (selectedNamespace === null) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center'}}>
        <Button title="agri" onPress={() => setSelectedNamespace(['agri','agric',30000])}/>
        <View style={{ height:100, width:"100%" }}></View>
        <Button title="protezionecivile" onPress={() => setSelectedNamespace(['protezionecivile','protciv',30001])}/>
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        {selectedDevice === null && <DevicesList endpoint={selectedNamespace[1]} sendSelectedDevice={device => setSelectedDevice(device)} returnToNamespace={() => setSelectedNamespace(null)} />}
        {selectedDevice !== null && <RemoteController namespace={selectedNamespace[0]} endpoint={selectedNamespace[1]} port={selectedNamespace[2]} device={selectedDevice} socket={socket} returnToList={() => setSelectedDevice(null)} />}
      </View>
    );
  }
}
