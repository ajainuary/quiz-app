import React, { Component } from 'react';
import './Register.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';

class Register extends Component {
	constructor() {
		super();
		this.state = {
			formData : {
				username : "",
				password : "",
				role : "",
			},
			submitted : false,
			errors : {
				errored : false,
				message : "",
			},
			success : false
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUsernameChange = this.handleUsernameChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleRoleChange = this.handleRoleChange.bind(this);
	}

	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append('username', this.state.formData.username);
		formData.append('password', this.state.formData.password);
		formData.append('role', this.state.formData.role);
		fetch('http://localhost:3000/register', {
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
					this.setState({errors: {"errored" : false, "message" : ""}, success: true});
					
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

	handleRoleChange (event) {
		let x = {...this.state.formData,
					"role" : event.target.value};
		this.setState({formData : x});
	}

	render() {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="register-form">
				<h2>Register</h2>
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Thanks for Signing up, You can now login" />
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input type="text" className="form-control" placeholder="Username" id="username" onChange={this.handleUsernameChange} />
				</div>
				<div className="form-group">
				    <label htmlFor="password">Password</label>
				    <input type="password" className="form-control" placeholder="Password" id="password" onChange={this.handlePasswordChange} />
			    </div>
			    <div className="form-group">
					<label htmlFor="role">Role</label>
					<select className="custom-select" id="role" onChange={this.handleRoleChange} value={this.state.role}>
				      <option value="admin">Admin</option>
				      <option value="user">User</option>
				    </select>
				</div>
			    <button type="submit" className="btn btn-primary">Submit</button>	
			</form>
			</div>
			);
	}
	
}
export default Register;