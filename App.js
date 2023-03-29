import React, { useCallback, useState, useLayoutEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { Avatar } from 'react-native-elements';
// import { auth, db } from 'firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import {Bubble, GiftedChat, InputToolbar} from 'react-native-gifted-chat';

const Chat = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // add isLoading state


  const onSend = useCallback((messages = []) => {
    setIsLoading(true); // set isLoading state to true
    const { _id, createdAt, text, user } = messages[0];

    addDoc(collection(db, 'chats'), { _id, createdAt, text, user })
        .then(() => setIsLoading(false)) // set isLoading state to false when addDoc is completed
        .catch((error) => setIsLoading(false));
  }, []);

  const renderFooter = useCallback(() => {
    return isLoading ? <Text style={styles.loading}>Loading...</Text> : null;
  }, [isLoading]);

  const deleteMessage = async (_id) => {
    const collectionRef = db.collection('chats');
    const query = collectionRef.where('_id', '==', _id);

    query.get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            //console.log(doc.id, '=>', doc.data());
            deleteDoc(doc(db, 'chats', doc.id)).catch((error) => console.log(error));
          });
        })
        .catch((error) => {
          console.log('Error getting documents: ', error);
        });
  }

  return (
      <GiftedChat
          messages={messages}
          showAvatarForEveryMessage={true}
          onSend={messages => onSend(messages)}
          user={{
            _id: "bob",
            name: "bob"
          }}
          renderFooter={renderFooter}
          renderMessageText={props => (
              <View style={{ flexDirection: 'column', alignItems: 'center', paddingLeft:10, paddingRight:10}}>
                <TouchableOpacity
                    onLongPress={() => {
                      Alert.alert(
                          'Delete Message',
                          'Are you sure you want to delete this message?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel'
                            },
                            {
                              text: 'Delete',
                              onPress: () => deleteMessage(props.currentMessage._id)
                            }
                          ]
                      )
                    }}
                    style={{ flexDirection: 'column', alignItems: 'center', paddingLeft:10, paddingRight:10}}
                >
                  <Text style={{ fontWeight: 'bold', marginRight: 5 }}>{props.currentMessage.user.name}: </Text>
                  <Text>{props.currentMessage.text}</Text>
                </TouchableOpacity>
              </View>
          )}
          renderBubble={props => {
            return (
                <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {
                        backgroundColor: '#8267d9' // purple for sent messages
                      },
                      left: {
                        backgroundColor: '#cccccc' // gray for received messages
                      }
                    }}
                />
            );
          }}
          renderInputToolbar={props => {return(
              <InputToolbar
                  {...props}
                  containerStyle={{
                    backgroundColor: '#cccccc',
                    borderTopColor: '#8267d9',
                    borderTopWidth: 2,
                  }}
                  textStyle={{ color: '#8267d9' }}
              />)}
          }
      />
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
    fontSize: 12,
    color: 'gray',
  },
});

export default Chat;