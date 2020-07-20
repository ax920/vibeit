import React from 'react';
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import * as Moods from './Moods'
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
            topTrackFeatures: [],
            songsToAdd: [] // Clear upon creation of playlist
        }
    }
    async componentDidMount() {
        const openRequest = window.indexedDB.open('toDoList');
        const get_saved_tracks_url = 'https://api.spotify.com/v1/me/tracks';
        console.log('access token', this.state.jwt.access_token)
        this.getPlaylistSongs();
        // this.getAllSavedTracks(get_saved_tracks_url, 50, 0);
        this.getTopTracks();
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
            console.log("1", response)
            const songs = response.data.items;
            songs.map(song => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs, song]
                }))
            });
            this.mapFeaturesToTopTracks(0);
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
                    topTrackFeatures: [...prevState.topTrackFeatures, feature]
                }));
            });
            if (features.length == 0 || response.data.audio_features.length == 1) {
                let tempCopyFeatures = [...this.state.topTrackFeatures];
                tempCopyFeatures = tempCopyFeatures.slice(0, -1);
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    topTrackFeatures: tempCopyFeatures
                }));
                console.log("toptracks features", this.state.topTrackFeatures);
                this.state.topSongs.map((song, i) => {
                    const matchingFeature = this.state.topTrackFeatures.find((feature, j) => {
                        return feature.id === song.id;
                    });
                    song.features = matchingFeature;
                })
                this.appendTracksToAdd(Moods.WORKOUT);
                return;
            } else {
                this.mapFeaturesToTopTracks(offset + 100);
            }
        });
    }

    appendTracksToAdd(mood) {
        console.log(this.state.topSongs);
        const sorted = this.state.topSongs.sort(function (a, b) {
            return b.features[mood] - a.features[mood];
        });
        console.log(sorted) // NICEIIEIEIE  OSRTED SHESHRHERHERHEHR
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
                    topTrackFeatures: [...prevState.topTrackFeatures, feature]
                }));
            });
            if (features.length == 0 || response.data.audio_features.length == 1) {
                let tempCopyFeatures = [...this.state.topTrackFeatures];
                tempCopyFeatures = tempCopyFeatures.slice(0, -1);
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs],
                    topTrackFeatures: tempCopyFeatures
                }));
                console.log(this.state.topTrackFeatures)
                const indices = Math.ceil(this.state.topTrackFeatures.length / 50);
                let currentAllFeatures = this.state.topTrackFeatures;
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

    getPlaylistSongs() {
        axios.get('https://api.spotify.com/v1/playlists/3Iq4kzgB5UDkf0zQEn0TqU/tracks', {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
        }).then(response => {
            console.log(response);
        });
    }

    render() {
        if (!this.state.topTrackFeatures || this.state.topTrackFeatures.length <= 0) {
            return (<h1>Loading...</h1>)
        }
        const features = this.state.topTrackFeatures;
        const array = [];
        for (let i = 0; i < features.length; i++) {
            if (features[i]) {
                array.push({ x: i, y: features[i].valence });
            }
        }
        return (
            <React.Fragment>
                <h1>Stats</h1>
                <ScatterChart width={400} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis dataKey={'x'} type="number" name='stature' unit='id' />
                    <YAxis dataKey={'y'} type="number" name='weight' unit='' />
                    <Scatter name='Playlist Statistics' data={array} fill='#8884d8' />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                </ScatterChart>
            </React.Fragment>
        )
    }
}