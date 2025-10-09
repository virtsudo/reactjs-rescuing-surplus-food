import {Alert} from 'react-bootstrap';
import {Link} from 'react-router-dom';

function PageNotFound() {

    return <Alert variant='danger' className='page-not-fount-main'>
        <h1>Page not found...</h1>
        <p><Link to='/' className='page-not-fount-link'>Please go back to the home page</Link></p>
    </Alert>

}

export {PageNotFound}