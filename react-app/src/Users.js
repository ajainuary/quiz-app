import React, { Component } from 'react';
import './Listing.css';
import ErrorMessage from './Error';
import SuccessMessage from './Success';
class Users extends Component {
	constructor() {
		super();
		this.state = {
			users : [],
			errors : {
				errored : false,
				message : "",
			},
			loaded : false,
			success : false,
		};
	}
	componentDidMount() {
		fetch('http://localhost:3000/users', {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
		result => {
			if(result.status === "SUCCESS")
				this.setState({users : result.users, loaded : true});
			else
				this.setState({errors : {errored : true, message : result.message}});
		},
		err => console.log(err)),
		err => console.log(err));
	}

	handleDelete(id) {
		fetch('http://localhost:3000/delete_user/'+ id, {
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
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		let success = this.state.success;
		if(this.state.loaded)
		{
				return <div className="listing">
				<ErrorMessage show={errored} message={message} />
				<SuccessMessage show={success} message="User was deleted successfully" />
				<table className="table table-hover">
					<thead>
				    <tr>
				      <th scope="col">Username</th>
				      <th scope="col">Actions</th>
				    </tr>
					</thead>
					<tbody>
					{this.state.users.map((item, key) =>
	                  <tr key = {key}>
	                      <th scope="row">{item.Username}</th>
	                      <td><button type="button" className="btn btn-danger" onClick={() => this.handleDelete(item.ID)}>Delete</button></td>
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
export default Users;