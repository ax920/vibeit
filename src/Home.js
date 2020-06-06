import React from 'react';
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
const axios = require('axios').default;
const querystring = require('query-string');

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            access_token: this.props.jwtData.access_token,
            expires_in: this.props.jwtData.expires_in,
            refresh_token: this.props.jwtData.refresh_token,
            scope: this.props.jwtData.scope,
            token_type: this.props.jwtData.token_type
        }
    }
    componentDidMount() {
        const request_url = 'https://api.spotify.com/v1/me/top/tracks';
        axios.get(request_url, {
            headers: {
                'Authorization': 'Bearer ' + this.state.access_token
            }
        }).then(response => {
            console.log(response);
        });
    }

    render() {
        return <h1>this is home</h1>
    }
}