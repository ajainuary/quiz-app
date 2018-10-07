import React, { Component } from 'react';
import SuccessMessage from './Success';

class Logout extends Component {
	constructor() {
		super();
		this.state = {
			success : false
		}
	}

	componentDidMount() {
		fetch('http://localhost:3000/logout', {
			credentials: 'include',
			method: 'GET',
		}).then(response => response.json().then(result => {
			if(result.status === "SUCCESS")
			{
				this.setState({success : true});
			}
		},
		err => console.log(err)),
		err => console.log(err));
	}

	render() {
		let message = <h2> Logging out, please wait.... </h2>;
		if(this.state.success)
			message = <SuccessMessage show={true} message="Successfully Logged Out, Please Close this Window" />
		return message;
	}
}
export default Logout;