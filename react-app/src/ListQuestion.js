import React, { Component } from 'react';
import {Link, Redirect} from 'react-router-dom';
import Authenticate from './Auth';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
import './Listing.css'
class ListQuestion extends Component {
	constructor(props) {
		super();
		this.state = {
			questions : [],
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
		this.handleNewQuestion = this.handleNewQuestion.bind(this);
	}
	componentDidMount() {
		Authenticate.bind(this)();
		fetch('http://localhost:3000/list_questions/'+this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({questions : result.questions, loaded : true, quiz : result.quiz});
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleNewQuestion(event) {
		event.preventDefault();
		fetch('http://localhost:3000/add_question/'+this.state.id, {
			credentials: 'include',
			method: 'GET'
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
			{
				console.log(result)
				this.setState({redirect : true, redirectLocation : "/edit_question/" + result.id})
			}
		},
		err => console.log(err)),
		err => console.log(err));
	}
	handleDelete(id) {
		fetch('http://localhost:3000/delete_question/'+ id, {
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
			<h2>{this.state.quiz}</h2>
			<ErrorMessage show={errored} message={message} />
			<SuccessMessage show={success} message="Question was deleted successfully" />
			<table className="table table-hover">
				<thead>
			    <tr>
			      <th scope="col">Statement</th>
			      <th scope="col">Points</th>
			      <th scope="col">Bonus</th>
			      <th scope="col"><button type="button" className="btn btn-success" onClick={this.handleNewQuestion}>New</button></th>
			    </tr>
				</thead>
				<tbody>
				{this.state.questions.map((item, key) =>
                  <tr key = {key}>
                      <th scope="row">{item.Statement}</th>
                      <td>{item.Points}</td>
                      <td>{item.Bonus}</td>
                      <td><Link to={`/options/${item.ID}`}><button type="button" className="btn btn-primary">Options</button></Link><Link to={`/edit_question/${item.ID}`}><button type="button" className="btn btn-info">Edit</button></Link><button type="button" className="btn btn-danger" onClick={() => this.handleDelete(item.ID)}>Delete</button></td>
                  </tr>
             )}
				</tbody>
			</table>
			</div>
			else
				return null;
		}
		else
		{
			return null; //Add Redirect to login
		}
	}
}
export default ListQuestion;