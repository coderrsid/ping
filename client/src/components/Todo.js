import React, { Component } from 'react';
import { getList, addToList, deleteItem, updateItem } from './UserFunctions';
import jwt_decode from 'jwt-decode'
import moment from 'moment';

import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import CardContent from '@material-ui/core/CardContent';

const styles = (theme) => ({
	content: {
		flexGrow: 1,
		padding: theme.spacing(3)
	},
	appBar: {
		position: 'relative'
	},
	title: {
		marginLeft: theme.spacing(2),
		flex: 1
	},
	submitButton: {
		display: 'block',
		color: 'white',
		textAlign: 'center',
		position: 'absolute',
		top: 14,
		right: 10
	},
	floatingButton: {
		position: 'fixed',
		bottom: 0,
		right: 0
	},
	form: {
		width: '98%',
		marginLeft: 13,
		marginTop: theme.spacing(3)
	},
	toolbar: theme.mixins.toolbar,
	root: {
		minWidth: 470
	},
	bullet: {
		display: 'inline-block',
		margin: '0 2px',
		transform: 'scale(0.8)'
	},
	pos: {
		marginBottom: 12
	},
	uiProgess: {
		position: 'fixed',
		zIndex: '1000',
		height: '31px',
		width: '31px',
		left: '50%',
		top: '35%'
	},
	dialogeStyle: {
		maxWidth: '50%'
	},
	viewRoot: {
		margin: 0,
		padding: theme.spacing(2)
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

class Todo extends Component {
    constructor() {
        super()
        this.state = {
            id: '',
            title: '',
            reminder: '',
            userid: null,
            open: '',
            buttonType: '',
            items: [],
            errors: [],
            uiLoading: true,
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount () {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        this.setState({userid: decoded.identity.id, uiLoading: false});
        if(this.state.userid)
            this.getAll();
    }

    onChange = e => {
        this.setState({
            [e.target.name] : e.target.value,
        })
    }

    getAll = () => {
        getList(this.state.userid).then(data => {
            this.setState({
                title: '',
                reminder: '',
                items: [...data]
            },
                () => {
                    console.log(this.state.title)
                })
        })
    }

    onSubmit = e => {
        e.preventDefault();
        this.setState({ editDisabled: '' })
        addToList(this.state.userid ,this.state.title, this.state.reminder).then(() => {
            this.getAll()
        })
        this.handleClose();
    }

    onUpdate = e => {
        console.log('update called');
        e.preventDefault();
        updateItem(this.state.title, this.state.reminder, this.state.userid, this.state.id).then(() => {
            this.getAll()
        })
        this.handleClose();
    }

    onDelete = (val) => {
        console.log('delete called');
        deleteItem(val, this.state.userid)

        var data = [...this.state.items]
        data.filter((item, index) => {
            if (item[1] === val && item) {
                data.splice(index, 1)
            }
            return true
        })
        this.setState({ items: [...data] })
    }

    handleClose = (event) => {
        this.setState({ open: false });
    };

    handleEditClickOpen = (data) => {
		this.setState({
			title: data[0],
            id: data[1],
            reminder: data[2],
			buttonType: 'Edit',
			open: true
        });
	}

    handleClickOpen = () => {
        this.setState({
            id: '',
            title: '',
            buttonType: '',
            open: true
        });
    };


    render () {

    	const { classes } = this.props;
        const { open, errors } = this.state;
        
        // return (
        //     <div className="col-md-18">
        //         <form onSubmit={this.onSubmit}>
        //             <div className="form-group">
        //                 <label className="col-md-4" htmlFor="input1">Task Name</label>
        //                 <label className="col-md-5" htmlFor="input2">Reminder</label>
        //                 <div className="row">
        //                     <div className="col-md-4">
        //                         <input
        //                             type="text"
        //                             className="form-control"
        //                             id="input1"
        //                             name="term"
        //                             value={this.state.term || ''}
        //                             onChange={this.onChange.bind(this)}
        //                         />
        //                     </div>
        //                     <div className="col-md-5" >
        //                        <input 
        //                             type="datetime-local" 
        //                             id="input2" 
        //                             className="form-control" 
        //                             name="reminder"
        //                             value={this.state.reminder || ''}
        //                             onChange={this.onChange.bind(this)}
        //                         />
        //                     </div>
        //                     <div className="col-md-2">
        //                         <button className="btn btn-primary"
        //                             onClick={this.onUpdate.bind(this)}>
        //                             Update
        //                         </button>
        //                     </div>
        //                 </div>
        //             </div>
        //             <button className="btn btn-success btn-block"
        //                 type="submit"
        //                 onClick={this.onSubmit.bind(this)}>
        //                 Submit
        //             </button>
        //         </form>
        //         <table className="table">
        //             <tbody>
        //                 {this.state.items.map((item, index) => {
        //                     console.log(item)
        //                     return <tr key={index}>
        //                         <td className="text-left">{item[0]}</td>
        //                         <td className="text-center">{item[2] ? moment (new Date(item[2])).fromNow() : "No reminder"}</td>
        //                         <td className="text-right">
        //                             <button className="btn btn-info mr-1"
        //                                 disabled={this.state.editDisabled}
        //                                 onClick={this.onEdit.bind(this, item[0], item[2], item[1])}>
        //                                 Edit
        //                             </button>

        //                             <button className="btn btn-danger"
        //                                 disabled={this.state.editDisabled}
        //                                 onClick={this.onDelete.bind(this, item[1])}>
        //                                 Delete
        //                             </button>
        //                         </td>
        //                     </tr>
        //                 })}
        //             </tbody>
        //         </table>
        //     </div>
        // )


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

					<IconButton
						className={classes.floatingButton}
						color="primary"
						aria-label="Add Reminder"
						onClick={this.handleClickOpen}
					>
						<AddCircleIcon style={{ fontSize: 60 }} />
					</IconButton>
					<Dialog fullScreen open={open} onClose={this.handleClose} TransitionComponent={Transition}>
						<AppBar className={classes.appBar}>
							<Toolbar>
								<IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
									<CloseIcon />
								</IconButton>
								<Typography variant="h6" className={classes.title}>
									{this.state.buttonType === 'Edit' ? 'Edit Reminder' : 'Create a new Reminder'}
								</Typography>
								<Button
									autoFocus
									color="inherit"
									onClick={(e) => this.state.buttonType === 'Edit' ? this.onUpdate(e) : this.onSubmit(e)}
									className={classes.submitButton}
								>
									{this.state.buttonType === 'Edit' ? 'Save' : 'Submit'}
								</Button>
							</Toolbar>
						</AppBar>

						<form className={classes.form} noValidate>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										variant="outlined"
										required
										fullWidth
										id="reminderTitle"
										label="Reminder Title"
										name="title"
										autoComplete="reminderTitle"
										helperText={errors.title}
										value={this.state.title}
										error={errors.title ? true : false}
										onChange={this.onChange.bind(this)}
									/>
								</Grid>
								<Grid item xs={20}>
                                    <TextField
                                        variant="outlined"
										required
										fullWidth
                                        id="reminderDetails"
                                        label="Reminder Time"
                                        type="datetime-local"
                                        value={this.state.reminder}
                                        helperText={errors.reminder}
                                        error={errors.reminder ? true : false}
                                        onChange={this.onChange.bind(this)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
								</Grid>
							</Grid>
						</form>
					</Dialog>

					<Grid container spacing={2}>
						{this.state.items ? this.state.items.map((item) => (
							<Grid key={item[1]} item xs={12} sm={6}>
								<Card className={classes.root} variant="outlined">
									<CardContent>
										<Typography variant="h5" component="h2">
											{item[0]}
										</Typography>
										<Typography className={classes.pos} color="textSecondary">
                                            {item[2] ? moment (new Date(item[2])).fromNow() : "No reminder"}
										</Typography>
									</CardContent>
									<CardActions>
										<Button size="small" color="primary" onClick={(e) => this.handleEditClickOpen(item)}>
											Edit
										</Button>
										<Button size="small" color="primary" onClick={(e) => this.onDelete(item[1])}>
											Delete
										</Button>
									</CardActions>
								</Card>
							</Grid>
						)) : <h1>No reminders!</h1>}
                        
					</Grid>
				</main>
			);
		}
    }
}

export default withStyles(styles)(Todo)