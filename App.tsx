/**
 * Copyright (c) 2017-present, Wonday (@wonday.org)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    Dimensions,
    SafeAreaView,
    View,
    Text,
    Platform
} from 'react-native';
import {
    Canvas,
    Text as TT,
    Path,
    useImage,
    Image,
    useCanvasRef,
} from "@shopify/react-native-skia";

import Pdf from 'react-native-pdf';
import Orientation from 'react-native-orientation-locker';

let source2 = require('./hh.pdf');

const WIN_WIDTH = Dimensions.get('window').width;
const WIN_HEIGHT = Dimensions.get('window').height;


export default class PDFExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            scale: 1,
            numberOfPages: 0,
            horizontal: false,
            width: WIN_WIDTH
        };
        this.pdf = null;
    }

    _onOrientationDidChange = (orientation) => {
        if (orientation == 'LANDSCAPE-LEFT' || orientation == 'LANDSCAPE-RIGHT') {
            this.setState({ width: WIN_HEIGHT > WIN_WIDTH ? WIN_HEIGHT : WIN_WIDTH, horizontal: true });
        } else {
            this.setState({ width: WIN_HEIGHT > WIN_WIDTH ? WIN_HEIGHT : WIN_WIDTH, horizontal: false });
        }
    };

    componentDidMount() {
        Orientation.addOrientationListener(this._onOrientationDidChange);

        (async () => {
            const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            // handling blobs larger than 64 KB on Android requires patching React Native (https://github.com/facebook/react-native/pull/31789)
            const result = await fetch(url);
            const blob = await result.blob();
            const objectURL = URL.createObjectURL(blob);
            this.setState({ ...this.state, objectURL, blob }); // keep blob in state so it doesn't get garbage-collected
        })();
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this._onOrientationDidChange);
    }

    prePage = () => {
        let prePage = this.state.page > 1 ? this.state.page - 1 : 1;
        this.pdf.setPage(prePage);
        console.log(`prePage: ${prePage}`);
    };

    nextPage = () => {
        let nextPage = this.state.page + 1 > this.state.numberOfPages ? this.state.numberOfPages : this.state.page + 1;
        this.pdf.setPage(nextPage);
        console.log(`nextPage: ${nextPage}`);
    };

    zoomOut = () => {
        let scale = this.state.scale > 1 ? this.state.scale / 1.2 : 1;
        this.setState({ scale: scale });
        console.log(`zoomOut scale: ${scale}`);
    };

    zoomIn = () => {
        let scale = this.state.scale * 1.2;
        // scale = scale > 3 ? 3 : scale;
        this.setState({ scale: scale });
        console.log(`zoomIn scale: ${scale}`);
    };

    switchHorizontal = () => {
        this.setState({ horizontal: !this.state.horizontal, page: this.state.page });
    };

    render() {
        let source = source2
        //let source = {uri:'http://samples.leanpub.com/thereactnativebook-sample.pdf',cache:true};
        //let source = {uri: 'ms-appx:///test.pdf'}
        //let source = require('./test.pdf');  // ios only
        //let source = {uri:'bundle-assets://test.pdf'};
        //let source = {uri: this.state.objectURL};

        //let source = {uri:'file:///sdcard/test.pdf'};

        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableHighlight disabled={this.state.page === 1}
                        style={this.state.page === 1 ? styles.btnDisable : styles.btn}
                        onPress={() => this.prePage()}>
                        <Text style={styles.btnText}>{'-'}</Text>
                    </TouchableHighlight>
                    <View style={styles.btnText}><Text style={styles.btnText}>Page</Text></View>
                    <TouchableHighlight disabled={this.state.page === this.state.numberOfPages}
                        style={this.state.page === this.state.numberOfPages ? styles.btnDisable : styles.btn}
                        testID='NextPage'
                        onPress={() => this.nextPage()}>
                        <Text style={styles.btnText}>{'+'}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight disabled={this.state.scale === 1}
                        style={this.state.scale === 1 ? styles.btnDisable : styles.btn}
                        onPress={() => this.zoomOut()}>
                        <Text style={styles.btnText}>{'-'}</Text>
                    </TouchableHighlight>
                    <View style={styles.btnText}><Text style={styles.btnText}>Scale</Text></View>
                    <TouchableHighlight
                     
                        onPress={() => this.zoomIn()}>
                        <Text style={styles.btnText}>{'+'}</Text>
                    </TouchableHighlight>
                    <View style={styles.btnText}><Text style={styles.btnText}>{'Horizontal:'}</Text></View>
                    <TouchableHighlight style={styles.btn} onPress={() => this.switchHorizontal()}>
                        {!this.state.horizontal ? (<Text style={styles.btnText}>{'false'}</Text>) : (
                            <Text style={styles.btnText}>{'true'}</Text>)}
                    </TouchableHighlight>

                </View>
                <View
                    style={{ flex: 1, width: this.state.width }}
                >

                    <Pdf ref={(pdf) => {
                        this.pdf = pdf;
                    }}
                    maxScale={25}
                        source={source}
                        trustAllCerts={false}
                        scale={this.state.scale}
                        horizontal={this.state.horizontal}
                        onLoadComplete={(numberOfPages, filePath, { width, height }, tableContents) => {
                            this.setState({
                                numberOfPages: numberOfPages
                            });
                            console.log(`total page count: ${numberOfPages}`);
                            console.log(tableContents);
                        }}
                        onPageChanged={(page, numberOfPages) => {
                            this.setState({
                                page: page
                            });
                            console.log(`current page: ${page}`);
                        }}
                        onError={(error) => {
                            console.log(error);
                        }}
                        style={{ flex: 1 }}
                    />

                    <Canvas style={{
                        backgroundColor: "yellow",
                        flex: 1,
                        opacity: 0.5,
                        height: 200,
                        top : 50,
                        left : 50,
                        width: this.state.width,
                        position: "absolute"
                    }}
                        pointerEvents="none"
                    >
                        <Path
                            path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
                            color="lightblue"
                        />
                    </Canvas>

                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    btn: {
        margin: 2,
        padding: 2,
        backgroundColor: "aqua",
    },
    btnDisable: {
        margin: 2,
        padding: 2,
        backgroundColor: "gray",
    },
    btnText: {
        margin: 2,
        padding: 2,
    }
});