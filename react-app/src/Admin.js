import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class Admin extends Component {
	constructor () {
		super();
		this.state = {
			errors : {
				errored : false,
				message : "",
			},
			redirect : false,
			redirectLocation : "",
		}
		this.handleNewGenre = this.handleNewGenre.bind(this);
	}
	handleNewGenre(event) {
		event.preventDefault();
		fetch('http://localhost:3000/add_genre', {
			credentials: 'include',
			method: 'GET'
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
			{
				console.log(result.message)
				this.setState({redirect : true, redirectLocation : "/edit_genre/" + result.ID})
			}
		},
		err => console.log(err)),
		err => console.log(err));
	}
	render () {
		if(this.state.redirect)
			return <Redirect to={this.state.redirectLocation} />
		else
			return (<div>
			<button type="button" className="btn btn-primary btn-lg" onClick={this.handleNewGenre}>Add Genre</button>
			</div>);
	}
}
export default Admin;