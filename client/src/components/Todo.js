import React, { Component } from 'react';
import { getList, addToList, deleteItem, updateItem } from './UserFunctions';
import jwt_decode from 'jwt-decode'
import moment from 'moment';
import SignaturePad from 'react-signature-canvas';

import Grow from '@material-ui/core/Fade';
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
import CardMedia from '@material-ui/core/CardMedia';

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
        minWidth: 380,
        maxWidth: 500,
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
    },
    sigContainer: {
        width: '100%',
        height: '40vh',
        margin: '0 auto',
        backgroundColor: '#fff',
        border: '1px solid black'
    },
    sigImage: {
        backgroundSize: "200px 50px",
        width: "200px",
        height: "50px",
        backgroundColor: "white"
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
            canvasDataURL: null,
            showSigPad: false
        }

        this.sigPad = React.createRef();
    }

    componentDidMount () {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        getList(decoded.identity.id).then(data => {
            this.setState({
                title: '',
                reminder: '',
                items: [...data]
            });
        })
        this.setState({userid: decoded.identity.id, uiLoading: false});
    }

    onChange = e => {
        this.setState({
            [e.target.name] : e.target.value,
        })
        console.log(e.target.value);
    }

    getAll = () => {
        this.setState({uiLoading: true});
        getList(this.state.userid).then(data => {
            console.log(data);
            this.setState({
                id: '',
                title: '',
                reminder: '',
                open: '',
                buttonType: '',
                items: [...data],
                uiLoading: false,
                canvasDataURL: null,
                showSigPad: false
            });
        })
    }

    onSubmit = e => {
        e.preventDefault();
        this.setState({ editDisabled: '' })
        addToList(this.state.userid ,this.state.title, this.state.reminder, this.state.canvasDataURL).then(() => {
            this.getAll()
        })
        this.handleClose();
    }

    onUpdate = e => {
        console.log('update called');
        e.preventDefault();
        updateItem(this.state.title, this.state.reminder, this.state.canvasDataURL, this.state.userid, this.state.id).then(() => {
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
            id: data[0],
			title: data[1],
            canvasDataURL: data[3],
			buttonType: 'Edit',
			open: true
        });
	}

    handleClickOpen = () => {
        this.setState({
            id: '',
            title: '',
            canvasDataURL: '',
            buttonType: '',
            open: true
        });
    };

    handleSignPad = (e) => {
        if(e === "remove"){
            this.setState({canvasDataURL: ''});
        } else {
            let show = this.state.showSigPad;
            this.setState({showSigPad: !show});
        }
    }

    clear = () => {
        this.sigPad.clear()
    }

    trim = () => {
        this.setState({canvasDataURL: this.sigPad.getTrimmedCanvas()
            .toDataURL('image/png')})
    }

    render () {
    	const { classes } = this.props;
        const { open, errors } = this.state;
        
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
                                        id="reminderDetails"
                                        label="Reminder"
                                        type="datetime-local"
                                        autoComplete="reminderDetails"
                                        className={classes.textField}
                                        value={this.state.reminder}
                                        helperText={errors.reminder}
                                        error={errors.reminder ? true : false}
                                        onChange={this.onChange.bind(this)}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
								</Grid>
                                <br></br>
                                <Grid item xs={12} >
                                    {this.state.showSigPad ? 
                                    <Grow in={this.state.showSigPad}>
                                        <div style={{display: 'inline-block', border: '0.8px solid black', padding:'10px 10px'}}>
                                            <SignaturePad
                                            canvasProps={{height:'300', width: '600', }}
                                                ref={(ref) => { this.sigPad = ref }} />
                                            <div>
                                                <Button variant="outlined" onClick={this.clear}>
                                                Clear
                                                </Button>
                                                <Button variant="outlined" onClick={this.trim}>
                                                Save
                                                </Button>
                                            </div>
                                        </div>
                                    </Grow>    
                                        :
                                        (
                                            !this.state.canvasDataURL ? 
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                                onClick={() => this.handleSignPad("add")}
                                                >
                                                    Add Canvas
                                            </Button> :
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                                onClick={() => this.handleSignPad("remove")}
                                            >
                                                Remove Canvas
                                            </Button>
                                        )
                                    }
                                </Grid>
							</Grid>
						</form>
					</Dialog>

					<Grid container spacing={2}>
						{this.state.items ? this.state.items.map((item) => (
							<Grid key={item[0]} item xs={12} sm={6}>
								<Card className={classes.root} variant="outlined">
									<CardContent>
                                        {item[3] ? <CardMedia className={classes.sigImage} image={item[3]} /> : null}
										<Typography variant="h5" component="h2">
											{item[1]}
										</Typography>
										<Typography className={classes.pos} color="textSecondary">
                                            {item[2] ? moment (new Date(item[2])).fromNow() : "No reminder"}
										</Typography>
                                        
									</CardContent>
									<CardActions>
										<Button size="small" color="primary" onClick={(e) => this.handleEditClickOpen(item)}>
											Edit
										</Button>
										<Button size="small" color="primary" onClick={(e) => this.onDelete(item[0])}>
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