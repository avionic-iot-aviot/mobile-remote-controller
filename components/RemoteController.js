import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput, ScrollView } from 'react-native';

const services_ports = {
    'agri': 30000,
    'protezionecivile': 30001
}

/**
 * Creates a view where it is possible to pilot a drone. This view has many buttons that send UDP datagrams
 * to the cluster wss.
 * @param {*} props Contains the property "namespace", the UDP socket instance, the selected "device" and the method returnToList.
 * @returns {Component} RemoteController
 */
export default function RemoteController(props) {
    const [socket, setData] = useState(props.socket);
    const [serverReply, setServerReply] = useState('Connected');
    const [text, setText] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [direction, setDirection] = useState({x: 0,y: 0,z: 0,_x: 0,_y: 0,_z: 0}); // first three are linear directions, last three are radial directions


    const sendPacket = (command) => {
        try {
            socket.send(`${command}`, undefined, undefined, services_ports[props.namespace], `udp.${props.namespace}.aviot.it`, function (err) {
                if (err) throw err
                console.log('Message sent!')
            });
        } catch (err) {
            console.log(err);
        }
    }

    socket.once('message', function (data, rinfo) {
        var str = String.fromCharCode.apply(null, new Uint8Array(data));
        console.log(
            'Received ' + str + ' ' + JSON.stringify(rinfo),
        );
        setServerReply('Received ' + str + ' ' + JSON.stringify(rinfo));
    });

    const emitEvent = (event, data) => {
        const dgram_msg = {
            event,
            data
        }
        sendPacket(JSON.stringify(dgram_msg));
    };

    const moveDrone = (key, value) => {
        var newDirection = {x: 0,y: 0,z: 0,_x: 0,_y: 0,_z: 0};
        if(key) {
            newDirection = {...direction}
            newDirection[key] = value;
        }
        setDirection(newDirection);
        emitEvent('cmd_vel', {copterId: props.device.copter_id, linear: {x: newDirection['x'], y: newDirection['y'], z: newDirection['z']}, radial: {_x: newDirection['x'], _y: newDirection['y'], _z: newDirection['z']}});
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.align_center}>
                <Text style={styles.title}>{props.device.current_name}</Text>
            </View>
            <View style={styles.align_center}>
                <Text>Reply from server</Text>
                <Text>{serverReply}</Text>
            </View>
            {/*<View style={{ marginTop: 15 }}>
                <Button title="SET MODE" onPress={() => sendPacket('set_mode')} />
            </View>*/}
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="ARM" onPress={() => emitEvent('arm', {copterId: props.device.copter_id})} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="LAND" onPress={() => emitEvent('land', {copterId: props.device.copter_id, latitude, longitude, altitude: 0})} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="TAKE-OFF" onPress={() => emitEvent('takeoff', {copterId: props.device.copter_id, latitude, longitude, altitude: 40})} />
                </View>
            </View>
            {/*<View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="SET" onPress={() => sendPacket('set')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="DELETE" onPress={() => sendPacket('delete')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="RESET" onPress={() => sendPacket('reset')} />
                </View>
            </View>*/}
            <View style={{ flexDirection: "row", marginTop: 15 , justifyContent: "center"}}>
                <View style={styles.row_buttons}>
                    <Button title="UP" onPress={() => moveDrone('y', 0.5)} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={[styles.row_buttons, styles.left_row_button]}>
                    <Button title="LEFT" onPress={() => moveDrone('x', -0.5)} />
                </View>
                <View style={[styles.row_buttons, styles.right_row_button]}>
                    <Button title="RIGHT" onPress={() => moveDrone('x', 0.5)} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 , justifyContent: "center"}}>
                <View style={styles.row_buttons}>
                    <Button title="DOWN" onPress={() => moveDrone('y', -0.5)} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={[styles.row_buttons]}>
                    <Button title="FORWARD" onPress={() => moveDrone('z', 0.5)} />
                </View>
                <View style={[styles.row_buttons]}>
                    <Button title="STOP" onPress={() => moveDrone(null, null)} />
                </View>
                <View style={[styles.row_buttons]}>
                    <Button title="BACKWARD" onPress={() => moveDrone('z', -0.5)} />
                </View>
            </View>

            <View style={{marginBottom: 30}} />

            <View style={styles.button}>
                <Button title="Back to list" onPress={props.returnToList} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        //justifyContent: 'center',
        marginTop: -20,
    },
    align_center: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        color: "black"
    },
    input: {
        height: 40,
        width: "66%",
        borderWidth: 1,
    },
    row_buttons: {
        width: "33%",
        marginRight: 1,
    },
    button: {
        width: "100%",
        marginTop: 10,
        marginBottom: 10
    },
    left_row_button: {
        left: 0,
        position: "relative",
    },
    right_row_button: {
        right: 0,
        position: "absolute",
    },
});
