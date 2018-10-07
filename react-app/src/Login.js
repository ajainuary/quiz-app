import React, { Component } from 'react';
import './Login.css';
import ErrorMessage from './Error';

class Login extends Component {
	constructor() {
		super();
		this.state = {
			formData : {
				username : "",
				password : "",
			},
			submitted : false,
			errors : {
				errored : false,
				message : "",
			},
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUsernameChange = this.handleUsernameChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
	}

	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append('username', this.state.formData.username);
		formData.append('password', this.state.formData.password);
		fetch('http://localhost:3000/login', {
			credentials: 'include',	
			method: 'POST',
			body: formData
		}).then((response) => {
			response.json().then((result) => {
				if(result.status !== "SUCCESS")
				{
					let x = {"errored" : true, "message" : result.message};
					this.setState({errors : x});
				}
				else
				{
					this.setState({errors: {"errored" : false, "message" : ""}});
					window.location.replace('/');
				}
			}, (err) => {
				console.log(err);
			})
		});
	}

	handleUsernameChange (event) {
		let x = {...this.state.formData,
					"username" : event.target.value};
		this.setState({formData : x});
	}

	handlePasswordChange (event) {
		let x = {...this.state.formData,
					"password" : event.target.value};
		this.setState({formData : x});
	}	

	render() {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="login-form">
				<h2>Login</h2>
				<ErrorMessage show={errored} message={message} />
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input type="text" className="form-control" placeholder="Username" id="username" onChange={this.handleUsernameChange} />
				</div>
				<div className="form-group">
				    <label htmlFor="password">Password</label>
				    <input type="password" className="form-control" placeholder="Password" id="password" onChange={this.handlePasswordChange} />
			    </div>
			    <button type="submit" className="btn btn-primary">Submit</button>	
			</form>
			</div>
			);
	}
	
}
export default Login;