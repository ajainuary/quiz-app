import React, { Component } from 'react';
import {Link, Redirect} from 'react-router-dom';
import Authenticate from './Auth';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
import './Listing.css'
class ListQuiz extends Component {
	constructor(props) {
		super();
		this.state = {
			quizzes : [],
			loaded : false,
			success : false,
			genre : "",
			id : props.id,
			auth : {auth : false, isAdmin : false},
			redirect : false,
			redirectLocation : "",
			errors : {
				errored : false,
				message : "",
			},
		};
		this.handleNewQuiz = this.handleNewQuiz.bind(this);
	}
	componentDidMount() {
		Authenticate.bind(this)();
		fetch('http://localhost:3000/list_quiz/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({quizzes : result.quizzes, loaded : true, genre : result.genre});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleNewQuiz(event) {
		event.preventDefault();
		fetch('http://localhost:3000/add_quiz/'+this.state.id, {
			credentials: 'include',
			method: 'GET'
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
			{
				console.log(result)
				this.setState({redirect : true, redirectLocation : "/edit_quiz/" + result.id})
			}
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleDelete(id) {
		fetch('http://localhost:3000/delete_quiz/'+ id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			console.log(result);
			if(result.status === "SUCCESS")
			{
				this.setState({success : true});
				window.location.reload();
			}
			else
				this.setState({success : false, errors : {errored : true, message : result.message}});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	render() {
		if(this.state.redirect)
			return <Redirect to={this.state.redirectLocation} />
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		if(this.state.loaded)
		{
			if(this.state.auth.isAdmin)
			return <div className="listing">
			<h2>{this.state.genre}</h2>
			<ErrorMessage show={errored} message={message} />
			<SuccessMessage show={success} message="Quiz was deleted successfully" />
			<table className="table table-hover">
				<thead>
			    <tr>
			      <th scope="col">Title</th>
			      <th scope="col">Play</th>
			      <th scope="col"><button type="button" className="btn btn-success" onClick={this.handleNewQuiz}>New</button></th>
			    </tr>
				</thead>
				<tbody>
				{this.state.quizzes.map((item, key) =>
                  <tr key = {key}>
                      <th scope="row">{item.Title}</th>
                      <td><Link to={`/play/${item.ID}`}><button type="button" className="btn btn-info">Play</button></Link></td>
                      <td><Link to={`/questions/${item.ID}`}><button type="button" className="btn btn-primary">Questions</button></Link><Link to={`/edit_quiz/${item.ID}`}><button type="button" className="btn btn-info">Edit</button></Link><button type="button" className="btn btn-danger" onClick={() => this.handleDelete(item.ID)}>Delete</button></td>
                  </tr>
             )}
				</tbody>
			</table>
			</div>
			else
			return <div className="listing">
			<h2>{this.state.genre}</h2>	
			<ErrorMessage show={errored} message={message} />
			<SuccessMessage show={success} message="Quizzes were deleted successfully" />
			<table className="table table-hover">
				<thead>
			    <tr>
			      <th scope="col">Title</th>
			      <th scope="col">Play</th>
			    </tr>
				</thead>
				<tbody>
				{this.state.quizzes.map(function(item, key) {
               return (
                  <tr key = {key}>
                      <th scope="row">{item.Title}</th>
                       <td><Link to={`/play/${item.ID}`}><button type="button" className="btn btn-info">Play</button></Link></td>
                  </tr>
                )
             })}
				</tbody>
			</table>
			</div>
		}
		else
		{
			return null; //Add Redirect to login
		}
	}
}
export default ListQuiz;