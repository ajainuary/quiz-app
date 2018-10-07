import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './Register.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class EditOption extends Component {
	constructor (props) {
		super();
		this.state = {
			statement : "",
			validty : "",
			id : props.id,
			errors : {
				errored : false,
				message : "",
			},
			success : false,
			quiz : 0,
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleStatementChange = this.handleStatementChange.bind(this);
		this.handleValidityChange = this.handleValidityChange.bind(this);
	}

	componentDidMount() {
		fetch('http://localhost:3000/get_option/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			console.log(result);
			if(result.status === "SUCCESS")
				this.setState({statement : result.statement, validity : result.validity, question : result.question});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append("id", this.state.id);
		formData.append("statement", this.state.statement);
		formData.append("validity", this.state.validity);
		fetch("http://localhost:3000/edit_option", {
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

	handleStatementChange(event) {
		this.setState({statement : event.target.value})
	}

	handleValidityChange(event) {
		this.setState({validity : event.target.value})
	}

	render () {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="register-form">
				<h2>Edit Option</h2>
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Changes were saved successfully" />
				<div className="form-group">
				    <label htmlFor="statement">Statement</label>
			        <textarea className="form-control" id="statement" rows="3" onChange={this.handleStatementChange} value={this.state.statement}></textarea>
			    </div>
			    <div className="form-group">
					<label htmlFor="validity">Validity</label>
					<select className="custom-select" id="validity" onChange={this.handleValidityChange} value={this.state.validity}>
				      <option value="true">Correct</option>
				      <option value="false">Incorrect</option>
				    </select>
				</div>
			    <button type="submit" className="btn btn-primary">Save</button>
			    <Link to={`/options/${this.state.question}`} ><button type="button" className="btn btn-info">Back</button></Link>
			</form>
			</div>
			);
	}
}

export default EditOption;