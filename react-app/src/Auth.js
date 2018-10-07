import React from 'react';
function Authenticate() {
	return fetch('http://localhost:3000/check', {
			credentials: 'include',
			method: 'GET',
		}).then((response) => {
			response.json().then((result) => {
				if(result.status === "SUCCESS")
				{
					if(result.role === "Admin")
						this.setState({auth : {auth : true, isAdmin : true}});
					else
						this.setState({auth : {auth : true, isAdmin : false}});
				}
				else
				{
					this.setState({auth : {auth : false, isAdmin : false}});
				}
			}, 
			(err) => {this.setState({auth : {auth : true, isAdmin : false}})})},  
			(err) => {this.setState({auth : {auth : true, isAdmin : false}})});
	}
export default Authenticate;