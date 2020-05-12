import React, { Component } from 'react'
import Todo from './Todo';
import Account from './Account';
import {withRouter} from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withStyles from '@material-ui/core/styles/withStyles';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import NotesIcon from '@material-ui/icons/Notes';
import Avatar from '@material-ui/core/avatar';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CircularProgress from '@material-ui/core/CircularProgress';

import jwt_decode from 'jwt-decode'

const drawerWidth = 240;

const styles = (theme) => ({
	root: {
		display: 'flex'
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0
	},
	drawerPaper: {
		width: drawerWidth
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3)
	},
	avatar: {
		height: 110,
		width: 100,
		flexShrink: 0,
		flexGrow: 0,
		marginTop: 20
	},
	uiProgess: {
		position: 'fixed',
		zIndex: '1000',
		height: '31px',
		width: '31px',
		left: '45%',
		top: '35%'
	},
	toolbar: theme.mixins.toolbar
});

class Home extends Component {

	constructor(props) {
		super(props);

		this.state = {
			firstName: '',
			lastName: '',
			uiLoading: true,
		};
	
	}

	componentDidMount () {
		const token = localStorage.usertoken;
		if(token) {
			const decoded = jwt_decode(token);
        	this.setState({firstName: decoded.identity.first_name, lastName: decoded.identity.last_name, uiLoading: false});
		}
    }

  	state = {
		render: false
	};

	loadAccountPage = (event) => {
		this.setState({ render: true });
	};

	loadTodoPage = (event) => {
		this.setState({ render: false });
	};

	logoutHandler = (e) => {
		e.preventDefault()
		localStorage.removeItem('usertoken')
		this.props.history.push(`/login`)
    }

  	render() {
		const { classes } = this.props;
		if (this.state.uiLoading === true) {
			return (
				<div className={classes.root}>
					{this.state.uiLoading && <CircularProgress size={150} className={classes.uiProgess} />}
				</div>
			);
		} else {
			return (
				<div className={classes.root}>
					<CssBaseline />
					<AppBar position="fixed" className={classes.appBar}>
						<Toolbar>
							<Typography variant="h6" noWrap>
								Reminder PRO
							</Typography>
						</Toolbar>
					</AppBar>
					<Drawer
						className={classes.drawer}
						variant="permanent"
						classes={{
							paper: classes.drawerPaper
						}}
					>
						<div className={classes.toolbar} />
						<Divider />
						<center>
							<Avatar src={this.state.profilePicture} className={classes.avatar} />
							<p>
								{' '}
								{this.state.firstName} {this.state.lastName}
							</p>
						</center>
						<Divider />
						<List>
							<ListItem button key="Todo" onClick={this.loadTodoPage}>
								<ListItemIcon>
									{' '}
									<NotesIcon />{' '}
								</ListItemIcon>
								<ListItemText primary="Todo" />
							</ListItem>

							<ListItem button key="Account" onClick={this.loadAccountPage}>
								<ListItemIcon>
									{' '}
									<AccountBoxIcon />{' '}
								</ListItemIcon>
								<ListItemText primary="Account" />
							</ListItem>

							<ListItem button key="Logout" onClick={this.logoutHandler}>
								<ListItemIcon>
									{' '}
									<ExitToAppIcon />{' '}
								</ListItemIcon>
								<ListItemText primary="Logout" />
							</ListItem>
						</List>
					</Drawer>

					<div>{this.state.render ? <Account /> : <Todo />}</div>
				</div>
			);
		}
	}
}

export default withStyles(styles)(withRouter(Home));
