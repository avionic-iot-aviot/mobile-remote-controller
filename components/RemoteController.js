import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput, ScrollView } from 'react-native';
import _ from 'lodash';

const services_ports = {
    'agri': 30000,
    'protezionecivile': 30001
}

const dateTimeOfNow = () => {
    var timestamp = Date.now();
    var d = new Date(timestamp);

    return  ("00" + d.getDate()).slice(-2) + "-" +
            ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
            d.getFullYear() + " " +
            ("00" + d.getHours()).slice(-2) + ":" +
            ("00" + d.getMinutes()).slice(-2) + ":" +
            ("00" + d.getSeconds()).slice(-2)
};

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

    /**
     * Sends a datagram containing a message passed as property.
     * @param {*} msg 
     */
    const sendPacket = (msg) => {
        try {
            socket.send(`${msg}`, undefined, undefined, services_ports[props.namespace], `udp.${props.namespace}.aviot.it`, function (err) {
                if (err) throw err
                console.log('Message sent!')
            });
        } catch (err) {
            console.log(err);
        }
    }

    socket.once('message', function (data, rinfo) {
        var data_json_str = String.fromCharCode.apply(null, new Uint8Array(data));
        console.log(
            'Received ' + data_json_str + ' ' + JSON.stringify(rinfo),
        );
        setServerReply([JSON.parse(data_json_str), JSON.stringify(rinfo)]);
    });

    /**
     * Send a datagram containing a message that is a json with two fields:
     * @param {*} event String referring to which event/action must be triggered
     * @param {*} data Json containing the needed data for the specified event
     */
    const emitEvent = (event, data) => {
        const dgram_msg = {
            event,
            data
        }
        sendPacket(JSON.stringify(dgram_msg));
    };

    /**
     * Allows to specify the drone's velocity and its movements direction.
     * @param {*} key String named as one of the linear axis (x,y,z) or radial axis (_x,_y,_z). If null is passed, it means that the drone must stop.
     * @param {*} value Float value for the speed
     */
    const moveDrone = (key, value) => {
        var newDirection = {x: 0,y: 0,z: 0,_x: 0,_y: 0,_z: 0};
        if(key) {
            newDirection = {...direction}
            newDirection[key] = value;
        }
        setDirection(newDirection);
        emitEvent('cmd_vel', { copterId, linear: { x: newDirection['x'], y: newDirection['y'], z: newDirection['z'] }, radial: { _x: newDirection['x'], _y: newDirection['y'], _z: newDirection['z'] } });
    };

    /**
     * It prints the server reply in a way that is possible to read.
     * @param {*} data Array containing two jsons.
     */
    const formatReplyMessage = (data) => {
        if(data && data[0].event)
            return `Message received!\nEvent: ${data[0].event}\nTime: ${dateTimeOfNow()}`;
        return "Connected";
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.align_center}>
                <Text style={styles.title}>{props.device.current_name}</Text>
            </View>
            {/*<View style={{ marginTop: 15 }}>
                <Button title="SET MODE" onPress={() => sendPacket('set_mode')} />
            </View>*/}
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="ARM" onPress={() => emitEvent('arm', { copterId })} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="LAND" onPress={() => emitEvent('land', { copterId, latitude, longitude, altitude: 0 })} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="TAKE-OFF" onPress={() => emitEvent('takeoff', { copterId, latitude, longitude, altitude: 40 })} />
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
                    <Button title="UP" onPress={() => moveDrone('z', 0.5)} />
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
                    <Button title="DOWN" onPress={() => moveDrone('z', -0.5)} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={[styles.row_buttons]}>
                    <Button title="FORWARD" onPress={() => moveDrone('y', 0.5)} />
                </View>
                <View style={[styles.row_buttons]}>
                    <Button title="STOP" onPress={() => moveDrone(null, null)} />
                </View>
                <View style={[styles.row_buttons]}>
                    <Button title="BACKWARD" onPress={() => moveDrone('y', -0.5)} />
                </View>
            </View>

            <View style={{marginBottom: 30}} />

            <View style={styles.align_center}>
                <Text style={{fontWeight: "bold"}}>Reply from server</Text>
                <Text style={{textAlign: "center"}}>{formatReplyMessage(serverReply)}</Text>
            </View>

            <View style={{ marginBottom: 30 }} />

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
