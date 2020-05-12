import React from 'react'
import { Link, withRouter, useLocation } from 'react-router-dom'
import Button from '@material-ui/core/Button';

function NoMatch() {

    let location = useLocation();

    return (
        <div>
            <h1>ERROR 404 - URL <em>({location.pathname})</em> is incorrect</h1>
            <Button>
                <Link to="/login">
                    Redirect to Home
                </Link>
            </Button>
        </div>
    )
}

export default withRouter(NoMatch)