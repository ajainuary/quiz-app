import React from 'react';
function ErrorMessage(props) {
		if(props.show)
			return <div className="alert alert-dismissible alert-danger"> <button type="button" className="close" data-dismiss="alert">&times;</button>{props.message}</div>;
		return null;
}
function Authenticate() {
	fetch('http://localhost:3000/check', {
			credentials: 'include',
			method: 'GET',
		}).then((response) => {
			response.json().then((result) => {
				if(result.status === "SUCCESS")
				{
					this.setState({status : true});
					console.log("Success");
				}
				else
				{
					this.setState({status : false});
					console.log(result);
				}
			}, (err) => {
				this.setState({status : false});
				console.log(err);
			})
		}, (err) => console.log(err));
}
export default ErrorMessage;
export default Authenticate;