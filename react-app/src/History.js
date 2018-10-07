import React, { Component } from 'react';
import './Listing.css';
import ErrorMessage from './Error';
class History extends Component {
	constructor() {
		super();
		this.state = {
			history : [],
			errors : {
				errored : false,
				message : "",
			},
			loaded : false,
		};
	}
	componentDidMount() {
		fetch('http://localhost:3000/history', {
			method: 'GET',
			credentials : 'include',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({history : result.history, loaded : true})
		},
		err => console.log(err)),
		err => console.log(err));
	}
	render() {
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		if(this.state.loaded)
		{
				return <div className="listing">
				<h2>Your History</h2>
				<ErrorMessage show={errored} message={message} />
				<table className="table table-hover">
					<thead>
				    <tr>
				      <th scope="col">Quiz</th>
				      <th scope="col">Genre</th>
				      <th scope="col">Total Score</th>
				    </tr>
					</thead>
					<tbody>
					{this.state.history.map((item, key) =>
	                  <tr key = {key}>
	                      <th scope="row">{item.Quiz}</th>
	                      <td>{item.Genre}</td>
	                      <td>{item.Score}</td>
	                  </tr>
	             )}
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
export default History;