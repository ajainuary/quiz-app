import React from 'react';
function SuccessMessage(props) {
		if(props.show)
			return <div className="alert alert-dismissible alert-success"> <button type="button" className="close" data-dismiss="alert">&times;</button>{props.message}</div>;
		return null;
}

export default SuccessMessage;
