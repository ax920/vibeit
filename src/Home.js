import React from 'react';
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
const axios = require('axios').default;
const querystring = require('query-string');

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jwt: {
                access_token: this.props.jwtData.access_token,
                expires_in: this.props.jwtData.expires_in,
                refresh_token: this.props.jwtData.refresh_token,
                scope: this.props.jwtData.scope,
                token_type: this.props.jwtData.token_type
            },
            topSongs: [],
            allSongs: [],
            audioTrackFeatures: []
        }
    }
    async componentDidMount() {
        const openRequest = window.indexedDB.open('toDoList');
        const get_saved_tracks_url = 'https://api.spotify.com/v1/me/tracks';
        // if (localStorage.getItem('all songs') === null) {
        console.log('access token', this.state.jwt.access_token)
        this.getAllSavedTracks(get_saved_tracks_url, 50, 0);
        // } else {
        // this.state.allSongs = JSON.parse(localStorage.getItem('all songs') || "[]");
        // }
        this.getTopTracks(); // TODO set it to localstorage as well so don't have to do everytime
        // await this.mapFeaturesToSavedTracks(0);
        // if (localStorage.getItem('feature 1') === null) {
        // } else {
        //     console.log(JSON.parse(localStorage.getItem('all songs') || "[]")); // TODO parse into state
        // }
    }

    getTopTracks() {
        const get_top_tracks_url = 'https://api.spotify.com/v1/me/top/tracks';
        axios.get(get_top_tracks_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
            params: {
                limit: 50,
                offset: 0
            }
        }).then(response => {
            // console.log("FIRST", response.data.items);
            const songs = response.data.items;
            songs.map(song => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs, song]
                }))
            });
            axios.get(get_top_tracks_url, {
                headers: {
                    'Authorization': 'Bearer ' + this.state.jwt.access_token
                },
                params: {
                    limit: 100,
                    offset: 50
                }
            }).then(response => {
                // console.log("SECOND", response.data.items);
                const songs = response.data.items;
                songs.map((song, index) => {
                    if (index !== 0) {
                        this.setState(prevState => ({
                            jwt: prevState.jwt,
                            topSongs: [...prevState.topSongs, song]
                        }))
                    }
                });
                axios.get(get_top_tracks_url, {
                    headers: {
                        'Authorization': 'Bearer ' + this.state.jwt.access_token
                    },
                    params: {
                        limit: 150,
                        offset: 100
                    }
                }).then(response => {
                    // console.log("THIRD", response.data.items);
                    const songs = response.data.items;
                    songs.map((song, index) => {
                        if (index !== 0) {
                            this.setState(prevState => ({
                                jwt: prevState.jwt,
                                topSongs: [...prevState.topSongs, song]
                            }))
                        }
                    });
                    console.log("top tracks", this.state.topSongs);
                    this.mapFeaturesToTopTracks(0);
                });
            });
        });
    }

    mapFeaturesToSavedTracks(offset) {
        const get_features_several_url = 'https://api.spotify.com/v1/audio-features';
        let ids = [];
        // for (let i = 0; i < Math.ceil(this.state.allSongs.length / 100); i++) {
        // const index = i * 100;
        const currSongs = this.state.allSongs.slice(offset, offset + 100);
        currSongs.map(song => {
            ids.push(song.id);
        });
        // }
        ids = ids.join(",")
        axios.get(get_features_several_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
            params: {
                ids: ids
            }
        }).then(response => {
            const features = response.data.audio_features;
            features.map(feature => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    audioTrackFeatures: [...prevState.audioTrackFeatures, feature]
                }));
            });
            if (features.length == 0 || response.data.audio_features.length == 1) {
                let tempCopyFeatures = [...this.state.audioTrackFeatures];
                tempCopyFeatures = tempCopyFeatures.slice(0, -1);
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    audioTrackFeatures: tempCopyFeatures
                }));
                console.log(this.state.audioTrackFeatures)
                const indices = Math.ceil(this.state.audioTrackFeatures.length / 50);
                let currentAllFeatures = this.state.audioTrackFeatures;
                // for (let i = 0; i < indices; i++) {
                //     const division = currentAllFeatures.slice(0, (i + 1) * 50);
                //     localStorage.setItem("features " + i, JSON.stringify(division));
                // }
                return;
            } else {
                this.mapFeaturesToSavedTracks(offset + 100);
            }
        });
    }

    mapFeaturesToTopTracks(offset) {
        const get_features_several_url = 'https://api.spotify.com/v1/audio-features';
        let ids = [];
        // for (let i = 0; i < Math.ceil(this.state.allSongs.length / 100); i++) {
        // const index = i * 100;
        const currSongs = this.state.topSongs.slice(offset, offset + 100);
        currSongs.map(song => {
            ids.push(song.id);
        });
        // }
        ids = ids.join(",")
        axios.get(get_features_several_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
            params: {
                ids: ids
            }
        }).then(response => {
            const features = response.data.audio_features;
            features.map(feature => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    audioTrackFeatures: [...prevState.audioTrackFeatures, feature]
                }));
            });
            if (features.length == 0 || response.data.audio_features.length == 1) {
                let tempCopyFeatures = [...this.state.audioTrackFeatures];
                tempCopyFeatures = tempCopyFeatures.slice(0, -1);
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    audioTrackFeatures: tempCopyFeatures
                }));
                console.log("toptracks features", this.state.audioTrackFeatures.map(track => track.danceability));
                const indices = Math.ceil(this.state.audioTrackFeatures.length / 50);
                let currentAllFeatures = this.state.audioTrackFeatures;
                // for (let i = 0; i < indices; i++) {
                //     const division = currentAllFeatures.slice(0, (i + 1) * 50);
                //     localStorage.setItem("features " + i, JSON.stringify(division));
                // }

                this.state.topSongs.map((song, i) => {
                    console.log(song, i)
                    const matchingFeature = this.state.audioTrackFeatures.find((feature, j) => {
                        return feature.id === song.id;
                    });
                    song.features = matchingFeature;
                })
                this.getUpbeat();
                return;
            } else {
                this.mapFeaturesToTopTracks(offset + 100);
            }
        });
    }

    getUpbeat() {

    }

    getAllSavedTracks(saved_tracks_url, limit, offset) {
        axios.get(saved_tracks_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
            params: {
                limit: limit,
                offset: offset
            }
        }).then(response => {
            const songs = response.data.items;
            songs.map(song => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs, song]
                }))
            })

            console.log("all songs - ", this.state.allSongs);
            if (songs.length == 0 || songs == null) {
                console.log("stopppp  ")
                // const indices = Math.ceil(this.state.allSongs.length / 250);
                // let currentAllSongs = this.state.allSongs;
                // let songDivisions = [];
                // for (let i = 0; i < indices; i++) {
                //     const division = currentAllSongs.slice(0, (i + 1) * 250);
                //     localStorage.setItem("division " + i, JSON.stringify(division));
                // }
                console.log(this.state.allSongs);
                // localStorage.setItem('all songs', JSON.stringify(this.state.allSongs));

                return;
            } else {
                // COMMENTED OUT FOR NOW TO TEST 50 tracks
                // this.getAllSavedTracks(saved_tracks_url, limit, offset + 50);
            }
        })
    }

    // getPlaylistSongs() {
    //     axios.get(saved_tracks_url, {
    //         headers: {
    //             'Authorization': 'Bearer ' + this.state.jwt.access_token
    //         },
    //         params: {
    //             limit: limit,
    //             offset: offset
    //         }
    //     }).then(response => {

    //     });
    // }

    render() {
        // console.log("test", this.state.audioTrackFeatures)
        if (!this.state.audioTrackFeatures || this.state.audioTrackFeatures.length <= 0) {
            return (<h1>Loading...</h1>)
        }
        const features = this.state.audioTrackFeatures;
        const array = [];
        for (let i = 0; i < features.length; i++) {
            if (features[i]) {
                array.push({ x: i, y: features[i].danceability });
            }
        }
        console.log("array", array);
        return (
            <React.Fragment>
                <h1>this is home</h1>
                <ScatterChart width={400} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis dataKey={'x'} type="number" name='stature' unit='cm' />
                    <YAxis dataKey={'y'} type="number" name='weight' unit='kg' />
                    <Scatter name='A school' data={array} fill='#8884d8' />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                </ScatterChart>
            </React.Fragment>
        )
    }
}