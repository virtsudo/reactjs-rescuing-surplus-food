import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Alert, Button, Container, Navbar, Row} from "react-bootstrap";
import {Cart4, PersonCircle} from "react-bootstrap-icons";
import {useEffect, useState} from "react";
import {BrowserRouter, useNavigate, Routes, Route, Link, Outlet} from "react-router-dom";
import {userLogout, listEstablishments} from "./API.js";
import {Login} from "./Login.jsx";
import {PageNotFound} from "./PageNotFound.jsx";
import {EstablishmentList} from "./EstablishmentList.jsx";
import {BagsList, BagsPage} from "./BagsList.jsx";
import {ShoppingCard} from "./ShoppingCard.jsx";
import {ReservedBags} from "./ReservedBags.jsx";


function App() {
    const [user, setUser] = useState();
    const [establishments, setEstablishments] = useState([]);
    const [bags, setBags] = useState([]);
    const [title, setTitle] = useState();
    const [orders, setOrders] = useState([]);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);


    useEffect(() => {
        listEstablishments().then((establishments)=>{
            if (establishments.length>0) establishments.sort((est1, est2)=>est1.name.localeCompare(est2.name));
            setEstablishments(establishments);
        });
    }, []);

    return <BrowserRouter>
        <Routes>
            <Route element={<Layout user={user} setUser={setUser} success={success} failure={failure} />}>
                <Route index element={<EstablishmentList establishments={establishments} user={user} setTitle={setTitle} orders={orders} />} />
                <Route path='/bags' element={<BagsPage establishments={establishments} user={user} setTitle={setTitle} setBags={setBags} />}>
                    <Route path='/bags/:idEstablishment'
                           element={<BagsList bags={bags} title={title} user={user} setOrders={setOrders}
                                              setEstablishments={setEstablishments} establishments={establishments} orders={orders} />} />
                </Route>
                <Route path='/:idUser/shopping-card' element={<ShoppingCard
                    orders={orders} setOrders={setOrders} establishments={establishments}
                    setEstablishments={setEstablishments} user={user}
                    setSuccess={setSuccess} setFailure={setFailure} success={success} failure={failure} />} />
                <Route path='/:idUser/reserved-bags' element={<ReservedBags
                    user={user} setSuccess={setSuccess} setFailure={setFailure} success={success} failure={failure}/>} />
                <Route path='/login' element={<Login setUser={setUser} />}/>
                <Route path='*' element={<PageNotFound />}/>
            </Route>
        </Routes>
    </BrowserRouter>
}

function Layout(props) {

    const navigate = useNavigate();
    const handleLogout = async ()=>{
        try {
            const result = await userLogout();
            if (result) {
                props.setUser();
                navigate('/');
            }
        } catch(err) {throw new Error(err);}
    }

    return <div>
        <Navbar className="bg-success fixed-top" variant="dark">
            <Container className="container-fluid d-flex justify-content-between m-0 nav-bar">
              <Navbar.Brand><Link className='nav-link' to='/'><Cart4/>{' '}Rescuing Surplus Food</Link></Navbar.Brand>
                <Navbar.Brand>
                  {
                    (props.user)?<Navbar.Text>{props.user.name}{' '}<PersonCircle className='ava'/>{' '}<Button variant='danger' onClick={handleLogout}>Logout</Button></Navbar.Text>:
                        <Link to='/login' className='nav-link'><Button variant='light' className='log-in'>Login</Button></Link>
                  }
                </Navbar.Brand>
            </Container>
        </Navbar>
        <Container className="container-fluid m-auto">
            {(props.success)?<Alert variant='success' className='below-nav1'>Conformation succeed</Alert>:''}
            {(props.failure)?<Alert variant='danger' className='below-nav1'>Conformation failed</Alert>:''}
            <Row className='vheight-100'>
                <Outlet />
            </Row>
        </Container>
    </div>
}

export default App
