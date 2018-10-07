import React, { Component } from 'react';
import './Listing.css';
import ErrorMessage from './Error';
class Leaderboard extends Component {
	constructor() {
		super();
		this.state = {
			board : [],
			errors : {
				errored : false,
				message : "",
			},
			loaded : false,
		};
	}
	componentDidMount() {
		fetch('http://localhost:3000/leaderboard', {
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({board : result.board, loaded : true})
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
				<h2>Top Users</h2>
				<ErrorMessage show={errored} message={message} />
				<table className="table table-hover">
					<thead>
				    <tr>
				      <th scope="col">User</th>
				      <th scope="col">Total</th>
				    </tr>
					</thead>
					<tbody>
					{this.state.board.map((item, key) =>
	                  <tr key = {key}>
	                      <th scope="row">{item.Username}</th>
	                      <td>{item.Total}</td>
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
export default Leaderboard;