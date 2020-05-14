import React, { Component } from 'react'
import {updateProfile} from './UserFunctions';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Card, CardActions, CardContent, Divider, Button, Grid, TextField } from '@material-ui/core';
import withMyHook from './withMyHook';
import clsx from 'clsx';
import jwt_decode from 'jwt-decode'

const styles = (theme) => ({
	content: {
		flexGrow: 1,
		padding: theme.spacing(3)
	},
	toolbar: theme.mixins.toolbar,
	root: {},
	details: {
		display: 'flex'
	},
	avatar: {
		height: 110,
		width: 100,
		flexShrink: 0,
		flexGrow: 0
	},
	locationText: {
		paddingLeft: '15px'
	},
	buttonProperty: {
		position: 'absolute',
		top: '50%'
	},
	uiProgess: {
		position: 'fixed',
		zIndex: '1000',
		height: '31px',
		width: '31px',
		left: '50%',
		top: '35%'
	},
	progess: {
		position: 'absolute'
	},
	uploadButton: {
		marginLeft: '8px',
		margin: theme.spacing(1)
	},
	customError: {
		color: 'red',
		fontSize: '0.8rem',
		marginTop: 10
	},
	submitButton: {
		marginTop: '10px'
	}
});

class Account extends Component {

    constructor(props) {
		super(props);
		this.state = {
			id: '',
			firstName: '',
			lastName: '',
			email: '',
			subscription: false,
			uiLoading: true,
		};
	}
	
	componentDidMount () {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        this.setState({
			id: decoded.identity.id,
			firstName: decoded.identity.first_name, 
			lastName: decoded.identity.last_name, 
			email: decoded.identity.email,
			uiLoading: false,
			buttonLoading: false,
		});
		if(decoded.identity.subscription)
			this.setState({subscription: true});
    }

    handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		});
	};

	updateFormValues = () => {
		this.setState({buttonLoading: true});
		
		const user = {
			id: this.state.id,
			firstName: this.state.firstName,
      		lastName: this.state.lastName
		};

		updateProfile(user)
			.then(function(response) {
				user.firstName = response.first_name;
				user.lastName = response.last_name;
			}
		);

		this.setState({firstName: user.firstName, lastName: user.lastName});
	}

	handlePushNotification = () => {
		this.props.onClickUserPermission();
	}
    
    render() {
		const { classes, ...rest } = this.props;
		if (this.state.uiLoading === true) {
			return (
				<main className={classes.content}>
					<div className={classes.toolbar} />
					{this.state.uiLoading && <CircularProgress size={150} className={classes.uiProgess} />}
				</main>
			);
		} else {
			return (
				<main className={classes.content}>
					<div className={classes.toolbar} />
					<Card {...rest} className={clsx(classes.root, classes)}>
						<CardContent>
							<div className={classes.details}>
								<div>
									<Typography className={classes.locationText} gutterBottom variant="h4">
										Account Details
									</Typography>
								</div>
							</div>
							<div className={classes.progress} />
						</CardContent>
						<Divider />
					</Card>

					<br />
					<Card {...rest} className={clsx(classes.root, classes)}>
						<form autoComplete="off" noValidate>
							<Divider />
							<CardContent>
								<Grid container spacing={3}>
									<Grid item md={6} xs={12}>
										<TextField
											fullWidth
											label="First name"
											margin="dense"
											name="firstName"
											variant="outlined"
											value={this.state.firstName}
											onChange={(e) => this.handleChange(e)}
										/>
									</Grid>
									<Grid item md={6} xs={12}>
										<TextField
											fullWidth
											label="Last name"
											margin="dense"
											name="lastName"
											variant="outlined"
											value={this.state.lastName}
											onChange={(e) => this.handleChange(e)}
										/>
									</Grid>
									<Grid item md={6} xs={12}>
										<TextField
											fullWidth
											label="Email"
											margin="dense"
											name="email"
											variant="outlined"
											disabled={true}
											value={this.state.email}
											onChange={(e) => this.handleChange(e)}
										/>
									</Grid>
									<Grid item md={6} xs={12}>
									<Button
										fullWidth
										variant="contained"
										color="primary"
										className={classes.submit}
										disabled={this.state.subscription}
										onClick={this.handlePushNotification}
									>
										Enable Push Notifications
									</Button>
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions />
						</form>
					</Card>
					<Button
						color="primary"
						variant="contained"
						type="submit"
						className={classes.submitButton}
						onClick={this.updateFormValues}
						disabled={
							!this.state.firstName ||
							!this.state.lastName
						}
					>
						Save details
					</Button>
				</main>
			);
		}
    }
}


export default withMyHook(withStyles(styles)(Account));