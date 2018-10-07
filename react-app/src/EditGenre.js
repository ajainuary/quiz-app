import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './Register.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class EditGenre extends Component {
	constructor (props) {
		super();
		this.state = {
			name : "",
			id : props.id,
			errors : {
				errored : false,
				message : "",
			},
			success : false
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
	}

	componentDidMount() {
		fetch('http://localhost:3000/get_genre/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({name : result.name});
			
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append("id", this.state.id);
		formData.append("name", this.state.name);
		fetch("http://localhost:3000/edit_genre", {
			credentials: 'include',
			method: 'POST',
			body: formData,
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({success : true});
			else
				this.setState({errors : {errored : true, message : result.message}});
		},
		err => console.log(err)),
		err => console.log(err));
	}

	handleNameChange(event) {
		this.setState({name : event.target.value})
	}

	render () {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="register-form">
				<h2>Edit Genre</h2>
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Changes were saved successfully" />
				<div className="form-group">
					<label htmlFor="name">Name</label>
					<input type="text" className="form-control" placeholder="Name" id="name" value={this.state.name} onChange={this.handleNameChange} />
				</div>
			    <button type="submit" className="btn btn-primary">Save</button>
			    <Link to="/genres"><button type="button" className="btn btn-info">Back</button></Link>
			</form>
			</div>
			);
	}
}

export default EditGenre;