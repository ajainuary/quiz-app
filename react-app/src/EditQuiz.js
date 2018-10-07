import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './Register.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class EditQuiz extends Component {
	constructor (props) {
		super();
		this.state = {
			title : "",
			id : props.id,
			errors : {
				errored : false,
				message : "",
			},
			success : false,
			genre : 0
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleTitleChange = this.handleTitleChange.bind(this);
	}

	componentDidMount() {
		fetch('http://localhost:3000/get_quiz/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			console.log(result);
			if(result.status === "SUCCESS")
				this.setState({title : result.title, genre : result.genre});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append("id", this.state.id);
		formData.append("title", this.state.title);
		fetch("http://localhost:3000/edit_quiz", {
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

	handleTitleChange(event) {
		this.setState({title : event.target.value})
	}

	render () {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="register-form">
				<h2>Edit Quiz</h2>
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Changes were saved successfully" />
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input type="text" className="form-control" placeholder={this.state.title} id="title" value={this.state.title} onChange={this.handleTitleChange} />
				</div>
			    <button type="submit" className="btn btn-primary">Save</button>
			    <Link to={`/quizzes/${this.state.genre}`} ><button type="button" className="btn btn-info">Back</button></Link>
			</form>
			</div>
			);
	}
}

export default EditQuiz;