import React, { Component } from 'react'
import { Animated, Dimensions, Image, FlatList, Modal, StyleSheet, ScrollView, View } from 'react-native';

import { Button, Block, Text } from '../components';
import { theme } from '../constants';
import { createUser } from "../actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const { width, height } = Dimensions.get('window');

class Welcome extends Component {
  static navigationOptions = {
    header: null,
  }

  scrollX = new Animated.Value(0);
  animatedValue = new Animated.Value(0)
  state = {
    showTerms: false,
  }
  componentDidMount() {
    setTimeout(() => {
      Animated.spring(this.animatedValue, {
        toValue: -400,
        duration: 400,
      }).start();
      setTimeout(() => {
        this.fadeView.setNativeProps({ zIndex: -1 })
      }, 400)
    }, 1000)
  }

  renderTermsService() {
    return (
      <Modal animationType="slide" visible={this.state.showTerms} onRequestClose={() => this.setState({ showTerms: false })}>

        <Block padding={[theme.sizes.padding * 2, theme.sizes.padding]} space="between">
          <Text h2 light>Terms of Service</Text>

          <ScrollView style={{ marginVertical: theme.sizes.padding }}>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              1. Your use of the Service is at your sole risk. The service is provided on an "as is" and "as available" basis.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              2. Support for Expo services is only available in English, via e-mail.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              3. You understand that Expo uses third-party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run the Service.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              4. You must not modify, adapt or hack the Service or modify another website so as to falsely imply that it is associated with the Service, Expo, or any other Expo service.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              5. You may use the Expo Pages static hosting service solely as permitted and intended to host your organization pages, personal pages, or project pages, and for no other purpose. You may not use Expo Pages in violation of Expo's trademark or other rights or in violation of applicable law. Expo reserves the right at all times to reclaim any Expo subdomain without liability to you.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              6. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without the express written permission by Expo.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              7. We may, but have no obligation to, remove Content and Accounts containing Content that we determine in our sole discretion are unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              8. Verbal, physical, written or other abuse (including threats of abuse or retribution) of any Expo customer, employee, member, or officer will result in immediate account termination.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              9. You understand that the technical processing and transmission of the Service, including your Content, may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.
            </Text>
            <Text caption gray height={24} style={{ marginBottom: theme.sizes.base }}>
              10. You must not upload, post, host, or transmit unsolicited e-mail, SMSs, or "spam" messages.
            </Text>
          </ScrollView>

          <Block middle padding={[theme.sizes.base / 2, 0]}>
            <Button gradient onPress={() => this.setState({ showTerms: false })}>
              <Text center white>I understand</Text>
            </Button>
          </Block>
        </Block>
      </Modal>
    )
  }

  renderIllustrations() {
    const { illustrations } = this.props;
    const texts = ['create unique decks', "use any card in the game", "duel your friends"]
    return (
      <FlatList
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToAlignment="center"
        data={illustrations}
        extraDate={this.state}
        keyExtractor={(item, index) => `${item.id}`}
        renderItem={({ item, index }) => (
          <View style={{ width, height: height / 2, backgroundColor: "transparent", borderRadius: 20, justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: width / 2, height: height / 2, backgroundColor: "rgb(219, 219, 220)", borderRadius: 20, justifyContent: "center", alignItems: "center" }}>
              <Text center bold>{texts[index]}</Text>
              <Text center bold></Text>

              <Image
                source={item.source}
                resizeMode="contain"
                style={{ width, height: height / 3, overflow: "hidden" }}
              />
            </View>
          </View>
        )}
        onScroll={
          Animated.event([{
            nativeEvent: { contentOffset: { x: this.scrollX } }
          }])
        }
      />
    )
  }

  renderSteps() {
    const { illustrations } = this.props;
    const stepPosition = Animated.divide(this.scrollX, width);
    return (
      <Block row center middle style={styles.stepsContainer}>
        {illustrations.map((item, index) => {
          const opacity = stepPosition.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Block
              animated
              flex={false}
              key={`step-${index}`}
              color="gray"
              style={[styles.steps, { opacity }]}
            />
          )
        })}
      </Block>
    )
  }

  render() {
    const { navigation } = this.props;

    return (
      <Block >
        <Animated.View style={{ position: "absolute", flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "transparent", zIndex: 20 }} ref={v => this.fadeView = v}>

          {/* <Animated.View style={{ position: "absolute", backgroundColor: interpolateColor, flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", left: 0, right: 0, top: 0, bottom: 0, zIndex: this.state.FadeViewZIndex }}> */}
          <Animated.View style={{ position: "absolute", left: this.animatedValue, top: 0, bottom: 0, width: Dimensions.get("window").width / 2, backgroundColor: 'rgb(230, 77, 61)', justifyContent: "center", alignItems: 'flex-end' }}>
            <Image source={require("../../assets/loadingGifAdvanced1.png")} style={{ height: 100, width: 50 }} />
          </Animated.View>
          <Animated.View style={{ position: "absolute", right: this.animatedValue, top: 0, bottom: 0, width: Dimensions.get("window").width / 2, backgroundColor: 'rgb(230, 77, 61)', justifyContent: "center", alignItems: 'flex-start' }}>
            <Image source={require("../../assets/loadingGifAdvanced2.png")} style={{ height: 100, width: 50 }} />
          </Animated.View>

        </Animated.View>
        <Block center bottom flex={0.4}>
          <Text h1 center bold>
            Welcome,
            <Text h1 primary> duelist.</Text>
          </Text>
          <Text h3 gray2 style={{ marginTop: theme.sizes.padding / 2 }}>
          </Text>
          <Text h3 gray2 style={{ marginTop: theme.sizes.padding / 2 }}>
            {/* Let's Duel. */}
          </Text>
        </Block>
        <Block center middle>
          {this.renderIllustrations()}
          {this.renderSteps()}
        </Block>
        <Block middle flex={0.5} margin={[0, theme.sizes.padding * 2]}>
          <Button gradient onPress={() => navigation.navigate('Login')}>
            <Text center semibold white>Login</Text>
          </Button>
          <Button shadow onPress={() => navigation.navigate('SignUp')}>
            <Text center semibold>Signup</Text>
          </Button>
          <Button onPress={() => this.setState({ showTerms: true })}>
            <Text center caption gray>Terms of service</Text>
          </Button>
        </Block>
        {this.renderTermsService()}
      </Block>
    )
  }
}

Welcome.defaultProps = {
  illustrations: [
    { id: 1, source: require('../../assets/images/deckConstructor.png') },
    { id: 2, source: require('../../assets/images/cardSearch.jpeg') },
    { id: 3, source: require('../../assets/images/duelingRoom.png') },
  ],
};


const mapStateToProps = (state) => {
  const { user, cards } = state
  return { user, cards }
};
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    createUser
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);


const styles = StyleSheet.create({
  stepsContainer: {
    position: 'absolute',
    bottom: theme.sizes.base * 3,
    right: 0,
    left: 0,
  },
  steps: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 2.5,
  },
})

