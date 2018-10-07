import React, { Component } from 'react';

class Check extends Component {
	constructor () {
		super();
		this.state = {status : false};
	}
	componentDidMount() {
		fetch('http://localhost:3000/check', {
			credentials: 'include',
			method: 'GET',
		}).then((response) => {
			response.json().then((result) => {
				if(result.status === "SUCCESS")
				{
					this.setState({status : true});
					console.log("Success");
				}
				else
				{
					this.setState({status : false});
					console.log(result);
				}
			}, (err) => {
				this.setState({status : false});
				console.log(err);
			})
		}, (err) => console.log(err));
	}
	render() {
		const status = this.state.status;
		return (
			<h1>{status ? 'YES' : 'NO'}</h1>
			);
	}
}
export default Check;