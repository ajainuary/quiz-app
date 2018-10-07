import React from 'react';
function ErrorMessage(props) {
		if(props.show)
			return <div className="alert alert-dismissible alert-danger"> <button type="button" className="close" data-dismiss="alert">&times;</button>{props.message}</div>;
		return null;
}

export default ErrorMessage;
