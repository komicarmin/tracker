import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button, Card, RadioButton, Snackbar, TextInput } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';

import { sendData, SingleNodeClient } from "@iota/iota.js";
import { Converter } from "@iota/util.js";

import useActors from '../hooks/useActors';
import useCrypto from '../hooks/useCrypto';
import Config from '../constants/Config';

export default function NewRecord() {
  const client = new SingleNodeClient(Config.API_ENDPOINT_PRIVATE);

  const [loading, setLoading] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [snackMessage, setSnackMessage] = React.useState("");
  const [snackVisible, setSnackVisible] = React.useState(false);

  const {sign, encrypt} = useCrypto();
  const actors = useActors();

  const actorFormList = actors.map(actor => { return { label: actor.actor, value: actor.actor } });

  const [form, setForm] = useState({
    actor: "",
    actor_key: "",
    order_id: "",
    comment: "",
    type: "Inbound"
  });

  const submitForm = async () => {
    const index = Converter.utf8ToBytes("TRACK-" + form.order_id);
    
    const formCopy = Object.assign(form);
    const privateKey = formCopy.actor_key;
    delete formCopy.actor_key;

    const formData = JSON.stringify(formCopy);
    
    const signature = sign(formData, privateKey);
    const encryptedData = encrypt(formData);
    const data = {
      signature: Array.from(signature),
      data: Array.from(encryptedData),
    }
    
    setLoading(true);
    const sendResult = await sendData(client, index, Converter.utf8ToBytes(JSON.stringify(data)));
    setLoading(false)

    setSnackMessage("Record successfully added.")
    setSnackVisible(true);
    setTimeout(() => { setSnackVisible(false) }, 3000);
  }

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>New Record</Text>
        <View>
          <View style={styles.inputGroup}>
            <DropDown
              label={'Actor'}
              mode={'outlined'}
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={form.actor}
              setValue={text => handleChange("actor", text)}
              list={actorFormList}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              mode="outlined"
              label="Actor key"
              value={form.actor_key}
              onChangeText={text => handleChange("actor_key", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              mode="outlined"
              label="Order id"
              value={form.order_id}
              onChangeText={text => handleChange("order_id", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              mode="outlined"
              label="Comment"
              value={form.comment}
              multiline
              onChangeText={text => handleChange("comment", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <RadioButton.Group
              value={form.type}
              onValueChange={value => handleChange("type", value)} >
              <View style={styles.radioButton}>
                <RadioButton value="Inbound" />
                <Text>Inbound</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton value="Outbound" />
                <Text>Outbound</Text>
              </View>
            </RadioButton.Group>
          </View>
          <View style={styles.inputGroup}>
            <Button
              mode="contained"
              onPress={() => submitForm()}>Submit</Button>
          </View>
        </View>
      </Card>
      {loading ? <Text style={styles.text}>Sending...</Text> : null}
      <View style={{ flex: 1, marginRight: 15 }}>
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          style={{ width: "100%", backgroundColor: "white", borderWidth: 1, borderColor: "lightgrey" }}
        >
          <Text style={{ color: "black" }}>{snackMessage}</Text>
        </Snackbar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: "whitesmoke",
  },
  text: {
    color: "#FF0000"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 25,
  },
  formCard: {
    padding: 15,
    marginBottom: 25,
    backgroundColor: "white"
  },
  newRecordForm: {
    flex: 1,
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center"
  }
});
