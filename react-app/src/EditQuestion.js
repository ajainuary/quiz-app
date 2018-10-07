import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './Register.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class EditQuestion extends Component {
	constructor (props) {
		super();
		this.state = {
			statement : "",
			points : "",
			bonus : "",
			id : props.id,
			errors : {
				errored : false,
				message : "",
			},
			success : false,
			quiz : 0,
			mediatype : "none",
			mediaurl : "",
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleStatementChange = this.handleStatementChange.bind(this);
		this.handlePointsChange = this.handlePointsChange.bind(this);
		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.handleMediaTypeChange = this.handleMediaTypeChange.bind(this);
		this.handleMediaUrlChange = this.handleMediaUrlChange.bind(this);
	}

	componentDidMount() {
		fetch('http://localhost:3000/get_question/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			console.log(result);
			if(result.status === "SUCCESS")
				this.setState({statement : result.statement, points : result.points, bonus : result.bonus, quiz : result.quiz, type : result.type, mediatype : result.mediatype, mediaurl : result.mediaurl});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleSubmit (event) {
		event.preventDefault();
		var formData = new FormData();
		formData.append("id", this.state.id);
		formData.append("statement", this.state.statement);
		formData.append("points", this.state.points);
		formData.append("type", this.state.type);
		formData.append("mediatype", this.state.mediatype);
		formData.append("mediaurl", this.state.mediaurl);
		fetch("http://localhost:3000/edit_question", {
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
		this.setState({statement : event.target.value});
	}

	handlePointsChange(event) {
		this.setState({points : event.target.value});
	}
	handleTypeChange(event) {
		this.setState({type : event.target.value});
	}

	handleMediaTypeChange(event) {
		this.setState({mediatype : event.target.value});
	}

	handleMediaUrlChange(event) {
		this.setState({mediaurl : event.target.value});
	}
	render () {
		console.log(this.state.quiz)
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		return (
			<div>
			<form onSubmit={this.handleSubmit} className="register-form">
				<h2>Edit Question</h2>
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Changes were saved successfully" />
				<div className="form-group">
				    <label htmlFor="statement">Statement</label>
			        <textarea className="form-control" id="statement" rows="3" onChange={this.handleStatementChange} value={this.state.statement}></textarea>
			    </div>
			    <div className="form-group">
					<label htmlFor="points">Points</label>
					<input type="text" className="form-control" placeholder={this.state.points} id="points" value={this.state.points} onChange={this.handlePointsChange} />
				</div>
				<div className="form-group">
					<label htmlFor="type">Type</label>
					<select type="text" className="custom-select" id="type" value={this.state.type} onChange={this.handleTypeChange}>
					  <option value="radio">Single Correct</option>
					  <option value="checkbox">Multiple Correct</option>
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="mediatype">Media Type</label>
					<select type="text" className="custom-select" id="mediatype" value={this.state.mediatype} onChange={this.handleMediaTypeChange}>
					  <option value="none">No Media</option>
					  <option value="youtube">YouTube</option>
					  <option value="audio">Audio</option>
					  <option value="image">Image</option>
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="mediaurl">Media URL</label>
					<input type="text" className="form-control" placeholder={this.state.mediaurl} id="mediaurl" value={this.state.mediaurl} onChange={this.handleMediaUrlChange} />
				</div>
			    <button type="submit" className="btn btn-primary">Save</button>
			    <Link to={`/questions/${this.state.quiz}`} ><button type="button" className="btn btn-info">Back</button></Link>
			</form>
			</div>
			);
	}
}

export default EditQuestion;