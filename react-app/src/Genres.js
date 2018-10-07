import React, { Component } from 'react';
import Authenticate from './Auth';
import {Link, Redirect} from 'react-router-dom';
import './Listing.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class Genres extends Component {
	constructor() {
		super();
		this.state = {
			genres : [],
			errors : {
				errored : false,
				message : "",
			},
			loaded : false,
			success : false,
			auth : {auth : false, isAdmin : false},
			redirect : false,
			redirectLocation : "",
		};
		this.handleNewGenre = this.handleNewGenre.bind(this);
	}
	componentDidMount() {
		Authenticate.bind(this)();
		fetch('http://localhost:3000/list_genres', {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({genres : result.genres, loaded : true})
		},
		err => console.log(err)),
		err => console.log(err));
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
	handleDelete(id) {
		fetch('http://localhost:3000/delete_genre/'+ id, {
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
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Genre was deleted successfully" />
				<table className="table table-hover">
					<thead>
				    <tr>
				      <th scope="col">Genre</th>
				      <th scope="col">Quizzes</th>
				      <th scope="col">Leaderboard</th>
				      <th scope="col"><button type="button" className="btn btn-success" onClick={this.handleNewGenre}>New</button></th>
				    </tr>
					</thead>
					<tbody>
					{this.state.genres.map((item, key) =>
	                  <tr key = {key}>
	                      <th scope="row">{item.Name}</th>
	                      <td><Link to={`/quizzes/${item.ID}`}><button type="button" className="btn btn-primary">View Quizzes</button></Link></td>
	                      <td><Link to={`/genre_leaderboards/${item.ID}`}><button type="button" className="btn btn-primary">Top Users</button></Link></td>
	                      <td><Link to={`/edit_genre/${item.ID}`}><button type="button" className="btn btn-info">Edit</button></Link><button type="button" className="btn btn-danger" onClick={() => this.handleDelete(item.ID)}>Delete</button></td>
	                  </tr>
	             )}
					</tbody>
				</table>
				</div>
			else
				return <div className="listing">
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="Genres were deleted successfully" />
				<table className="table table-hover">
					<thead>
				    <tr>
				      <th scope="col">Genre</th>
				      <th scope="col">Quizzes</th>
				      <th scope="col">Leaderboard</th>
				    </tr>
					</thead>
					<tbody>
					{this.state.genres.map(function(item, key) {
	               return (
	                  <tr key = {key}>
	                      <th scope="row">{item.Name}</th>
	                      <td><Link to={`/quizzes/${item.ID}`}><button type="button" className="btn btn-primary">View Quizzes</button></Link></td>
	                      <td><Link to={`/genre_leaderboards/${item.ID}`}><button type="button" className="btn btn-primary">Top Users</button></Link></td>
	                  </tr>
	                )
	             })}
					</tbody>
				</table>
				</div>
		}
		else
		{
			return null;
		}
	}
}
export default Genres;