import React from 'react';
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
            allSongs: []
        }
    }
    componentDidMount() {
        const top_tracks_url = 'https://api.spotify.com/v1/me/top/tracks';
        const saved_tracks_url = 'https://api.spotify.com/v1/me/tracks';
        if (localStorage.getItem('all songs') === null) {
            this.getAllSavedTracks(saved_tracks_url, 50, 0);
        } else {
            this.state.allSongs = JSON.parse(localStorage.getItem('all songs') || "[]");
        }
        this.getTopTracks(top_tracks_url); // TODO set it to localstorage as well so don't have to do everytime
        console.log(this.state.allSongs)
        console.log(JSON.parse(localStorage.getItem('all songs')));
        // let users = JSON.parse(localStorage.getItem("all songs") || "[]");
        // console.log(users)
    }

    getAllSavedTracks(saved_tracks_url, limit, offset) {
        console.log(offset);
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
                song = {
                    name: song.track.name,
                    id: song.track.id

                }
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs],
                    allSongs: [...prevState.allSongs, song]
                }))
            })
            console.log("tracksok", this.state.allSongs);
            if (songs.length == 0) {
                console.log("stopppp  ")
                // const indices = Math.ceil(this.state.allSongs.length / 250);
                // let currentAllSongs = this.state.allSongs;
                // let songDivisions = [];
                // for (let i = 0; i < indices; i++) {
                //     const division = currentAllSongs.slice(0, (i + 1) * 250);
                //     localStorage.setItem("division " + i, JSON.stringify(division));
                // }
                console.log(this.state.allSongs);
                localStorage.setItem('all songs', JSON.stringify(this.state.allSongs));
                return;
            } else {
                this.getAllSavedTracks(saved_tracks_url, limit, offset + 50);
            }
        })
    }

    getTopTracks(top_tracks_url) {
        axios.get(top_tracks_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.jwt.access_token
            },
            params: {
                limit: 50,
                offset: 0
            }
        }).then(response => {
            console.log("FIRST", response.data.items);
            const songs = response.data.items;
            songs.map(song => {
                this.setState(prevState => ({
                    jwt: prevState.jwt,
                    topSongs: [...prevState.topSongs, song]
                }))
            });

            axios.get(top_tracks_url, {
                headers: {
                    'Authorization': 'Bearer ' + this.state.jwt.access_token
                },
                params: {
                    limit: 100,
                    offset: 50
                }
            }).then(response => {
                console.log("SECOND", response.data.items);
                const songs = response.data.items;
                songs.map((song, index) => {
                    if (index !== 0) {
                        this.setState(prevState => ({
                            jwt: prevState.jwt,
                            topSongs: [...prevState.topSongs, song]
                        }))
                    }

                });
                console.log(this.state.topSongs);
                axios.get(top_tracks_url, {
                    headers: {
                        'Authorization': 'Bearer ' + this.state.jwt.access_token
                    },
                    params: {
                        limit: 150,
                        offset: 100
                    }
                }).then(response => {
                    console.log("THIRD", response.data.items);
                    const songs = response.data.items;
                    songs.map((song, index) => {
                        if (index !== 0) {
                            this.setState(prevState => ({
                                jwt: prevState.jwt,
                                topSongs: [...prevState.topSongs, song]
                            }))
                        }

                    });
                    console.log(this.state.topSongs);
                });
            });
        });
    }

    render() {
        return <h1>this is home</h1>
    }
}