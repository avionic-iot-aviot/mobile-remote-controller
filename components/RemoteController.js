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


    const sendPacket = (command) => {
        try {
            socket.send(`${command}`, undefined, undefined, services_ports[props.namespace], `${props.namespace}.udp.aviot.it`, function (err) {
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


    return (
        <ScrollView style={styles.container}>
            <View style={styles.align_center}>
                <Text style={styles.title}>{props.device.current_name}</Text>
            </View>
            <View style={styles.align_center}>
                <Text>Reply from server</Text>
                <Text>{serverReply}</Text>
            </View>
            <View style={{ marginTop: 15 }}>
                <Button title="SET MODE" onPress={() => sendPacket('set_mode')} />
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="ARM" onPress={() => sendPacket('arming')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="LAND" onPress={() => sendPacket('land')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="TAKE-OFF" onPress={() => sendPacket('takeoff')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="SET" onPress={() => sendPacket('set')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="DELETE" onPress={() => sendPacket('delete')} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="RESET" onPress={() => sendPacket('reset')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 , justifyContent: "center"}}>
                <View style={styles.row_buttons}>
                    <Button title="UP" onPress={() => sendPacket('delete')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={[styles.row_buttons, styles.left_row_button]}>
                    <Button title="LEFT" onPress={() => sendPacket('set')} />
                </View>
                <View style={[styles.row_buttons, styles.right_row_button]}>
                    <Button title="RIGHT" onPress={() => sendPacket('reset')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 , justifyContent: "center"}}>
                <View style={styles.row_buttons}>
                    <Button title="DOWN" onPress={() => sendPacket('delete')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={[styles.row_buttons, styles.left_row_button]}>
                    <Button title="FORWARD" onPress={() => sendPacket('set')} />
                </View>
                <View style={[styles.row_buttons, styles.right_row_button]}>
                    <Button title="BACKWARD" onPress={() => sendPacket('reset')} />
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
