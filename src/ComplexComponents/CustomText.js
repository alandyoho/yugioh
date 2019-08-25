import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
} from 'react-native';

export default class CustomText extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Text style={[styles.defaultStyle, this.props.style]}>
                {this.props.children}
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    defaultStyle: {
        fontFamily: "MatrixRegularSmallCaps"
    },
});