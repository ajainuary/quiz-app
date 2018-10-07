import React, { Component } from 'react';
import ErrorMessage from './Error';

function Media(props) {
	console.log(props.url);
	if(props.type === "youtube")
		return (
			<div className="row">
			<iframe type="text/html" width="773" height="435" src={props.url} frameBorder="0" title="youtube-embed" />
			</div>
			);
	if(props.type === "image")
		return (
			<div className="row">
				<img src={props.url} />
			</div>
			)
	if(props.type === "audio")
		return (
			<div className="row">
				<audio controls>
					<source src={props.url} type="audio/mpeg" />
				</audio>
			</div>
			)
	return null;
}

class Play extends Component {
	constructor (props) {
		super();
		this.state = {
			id : props.id, //Quiz ID
			quiz : {},
			index : 0,
			points : 0,
			pointsChange : 0,
			loaded : false,
			success : false,
			redirect : false,
			redirectLocation : "",
			errors : {
				errored : false,
				message : "",
			},
			selected : [],
		};
		this.handleTick = this.handleTick.bind(this);
		this.handleNext = this.handleNext.bind(this);
	}

	componentDidMount() {
		fetch("http://localhost:3000/play/" + this.state.id, {
			credentials: 'include',
			method: 'GET',
		}).then(
		response => response.json().then(
			result => {
				if(result.status === "SUCCESS")
				{
					try{
						console.log("length:", result.quiz.Questions[0].Options.length)
						this.setState({quiz : result.quiz, loaded : true, selected : Array.from(new Array(result.quiz.Questions[0].Options.length), () => false)});
					} catch (err) {
						this.setState({errors : {errored : true, message : "No Questions in this Quiz"}});
					}
				}
				else
					this.setState({errors : {errored : true, message : result.message}});
			},
			err => console.log(err)),
		err => console.log(err));
	}

	handleTick(key) {
		console.log(this.state.selected);
		try{
			if(this.state.quiz.Questions[this.state.index].Type === "radio") {
				let x = Array.from(new Array(this.state.quiz.Questions[this.state.index].Options.length), () => false);
				x[key] = true;
				this.setState({selected : x});
			} else {
				let x = Array.from(this.state.selected);
				if(x[key])
					x[key] = false;
				else
					x[key] = true;
				this.setState({selected : x});
			}
		} catch(err) {
			this.setState({errors : {errored : true, message : "No Options for this Question"}});
			return;
		}
	}

	handleNext(event) {
		event.preventDefault();
		var points = this.state.points;
		var pointsChange = 0;
		console.log(this.state.quiz.Questions[this.state.index].Options);
		console.log(this.state.selected);
		try {
		if(this.state.selected.reduce( (valid, current, index) => {
			if(!valid)
				return false;
			if((current && this.state.quiz.Questions[this.state.index].Options[index].Validity === "true") || (!current && this.state.quiz.Questions[this.state.index].Options[index].Validity === "false"))
			{
				console.log(index, "match");
				return true;
			}
			else
			{
				console.log(index, "not match");
				return false;
			}
		}, true))
		{
			points = points + Number(this.state.quiz.Questions[this.state.index].Points);
			pointsChange = Number(this.state.quiz.Questions[this.state.index].Points);
		}
	} catch (err) {
		console.log(err);
		this.setState({errors : {errored : true, message : "No Options for this Question"}});
		return;
	}
		if(this.state.index + 1 === this.state.quiz.Questions.length)
		{
			var formData = new FormData();
			formData.append("quiz", this.state.id);
			formData.append("genre", this.state.quiz.GenreID);
			formData.append("points", points);
			fetch("http://localhost:3000/submit_game", {
				credentials: 'include',
				method: 'POST',
				body: formData,
			}).then(response => {
				response.json().then(result => {
					if(result.status === "SUCCESS")
						this.setState({success : true, points : points});
					else
						this.setState({errors : {errored : true, message : result.message}, points : points});
				}, err => console.log(err))
			},err => console.log(err));
		}
		else
		{
			this.setState({index : this.state.index+1, pointsChange : pointsChange, points : points, selected : Array.from(new Array(this.state.quiz.Questions[this.state.index+1].Options.length), () => false)});
		}
	}

	render () {
		if(this.state.success)
		{
			return <div><div className="alert alert-dismissible alert-success">
			  <button type="button" className="close" data-dismiss="alert">&times;</button>
			  Thanks for playing! <br />
			  You scored {this.state.points} points.
			</div></div>
		}
		let errored = this.state.errors.errored;
		let message = this.state.errors.message;
		if(errored)
			return	<div><ErrorMessage show={errored} message={message} /></div>
		if(this.state.loaded)
		{
			const question = this.state.quiz.Questions[this.state.index];
			return (
				<div>
					<div className="row">
						<div className="col-md-8">
							<h2>{this.state.quiz.Title}</h2>
						</div>
						<div className="col-md-4">
							<div className="row">
								<h2>Score : {this.state.points} {this.state.pointsChange !== 0 ? `(+ ${this.state.pointsChange})` : null}</h2>
							</div>
							<div className="row">
								Points : +{question.Points} / {question.Type === "radio" ? "Single Correct" : "Multiple Correct"}
							</div>
						</div>
					</div>
				    <form onSubmit={this.handleNext}>
					<div className="card border-primary">
					  <div className="card-header">
					  <div className="row">
					  	<div className="col-md-8">{question.Statement}</div>
					  	<div className="col-md-4"><button type="submit" className="btn btn-primary">Next</button></div>
					  </div>
					  <Media type={question.MediaType} url={question.MediaURL} />
					  </div>
					  <div className="card-body">
					    {
					    	question.Options.map(
					    		(item, key) => 
					    			<div className={`custom-control custom-${question.Type}`} key={key}>
								      <input type={question.Type} id={key} name="option" className="custom-control-input" onChange={() => this.handleTick(key)} checked={!!this.state.selected[key]}/>
								      <label className="custom-control-label" htmlFor={key}>{item.Statement}</label>
								    </div>
					    		)
					    }
					  </div>
				    </div>
				    </form>
					</div>
				);
		}
		else
			return null;
	}
}

export default Play;