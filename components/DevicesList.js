import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, TouchableOpacity, Button, StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';

const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.current_name + " - " + item.copter_id}</Text>
  </TouchableOpacity>
);

/**
 * Creates a scrollable list of devices containing the word "fccs" and a button to return to the view where
 * is possible to choose the namespace.
 * @param {*} props Contains the "endpoint" properties and two methods: sendSelectedDevice and returnToNamespace.
 * @returns {Component} DeviceList
 */
export default function DevicesList(props) {
  const [data, setData] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const renderItem = ({ item }) => {
    const backgroundColor = selectedDevice && item.device_id === selectedDevice.device_id ? "#23395d" : "#add8e6";
    const color = selectedDevice && item.device_id === selectedDevice.device_id ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedDevice(item);
          props.sendSelectedDevice(item);
        }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  const getDevices = () => {
    fetch(`https://${props.endpoint}.aviot.it/dbapp/frontend/getAllDevices`)
      .then(res => res.json())
      .then(resjson => {
        const filteredItems = _.filter(resjson, (item) => _.includes(item.current_name, 'fccs'))
        setData(filteredItems);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    getDevices();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.device_id.toString()}
        renderItem={renderItem}
        extraData={selectedDevice}
      />
      <View style={styles.button}>
        <Button title="Refresh" onPress={getDevices} />
      </View>
      <View style={styles.button}>
        <Button title="Back to namespace" onPress={props.returnToNamespace} />
      </View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  item: {
    backgroundColor: '#add8e6',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
