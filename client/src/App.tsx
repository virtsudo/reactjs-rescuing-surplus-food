import {BrowserRouter, useNavigate, Routes, Route, Link, Outlet} from "react-router-dom";
import {Alert, Button, Container, Navbar, Row} from "react-bootstrap";
import {Cart4, PersonCircle} from "react-bootstrap-icons";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from "react";
import type {Bag, Establishment, Schedule, User} from "./model/AppModel";
import {userLogout, listEstablishments, listSchedules} from "./api/API.ts";
import {EstablishmentList} from "./app/EstablishmentList";
import {BagsList, BagsPage} from "./app/BagsList";
import {ShoppingCard} from "./app/ShoppingCard";
import {ReservedBags} from "./app/ReservedBags";
import {PageNotFound} from "./absent/PageNotFound.tsx";
import {Login} from "./login/Login";
import "./App.css";


function App() {
    const [user, setUser] = useState<User>();
    const [establishments, setEstablishments] = useState<Array<Establishment>>([]);
    const [schedules, setSchedules] = useState<Array<Schedule>>();
    const [bags, setBags] = useState<Array<Bag>>([]);
    const [title, setTitle] = useState<string>();
    const [orders, setOrders] = useState<Array<Schedule>>([]);
    const [success, setSuccess] = useState<boolean>(false);
    const [failure, setFailure] = useState<boolean>(false);

    useEffect(() => {
        listEstablishments().then((establishments: Array<Establishment>) => {
            if (establishments.length > 0) establishments.sort((est1, est2) => est1.name.localeCompare(est2.name));
            setEstablishments(establishments);
        });
        listSchedules().then((schedules: Array<Schedule>) => {
            console.log(schedules);
            setSchedules(schedules);
        });
    }, []);

    return <BrowserRouter>
        <Routes>
            <Route element={<Layout user={user} setUser={setUser} success={success} failure={failure}/>}>
                <Route index element={<EstablishmentList establishments={establishments} user={user} setTitle={setTitle}
                                                         orders={orders}/>}/>
                <Route path='/bags' element={<BagsPage establishments={establishments} user={user} setTitle={setTitle}
                                                       setBags={setBags}/>}>
                    <Route path='/bags/:idEstablishment'
                           element={<BagsList bags={bags} title={title} user={user} setOrders={setOrders}
                                              schedules={schedules}
                                              setEstablishments={setEstablishments} establishments={establishments}
                                              orders={orders}/>}/>
                </Route>
                <Route path='/:idUser/shopping-card' element={<ShoppingCard
                    orders={orders} setOrders={setOrders} establishments={establishments}
                    setEstablishments={setEstablishments} user={user}
                    setSuccess={setSuccess} setFailure={setFailure} success={success} failure={failure}/>}/>
                <Route path='/:idUser/reserved-bags' element={<ReservedBags schedules={schedules} setEstablishments={setEstablishments}
                                                                            user={user} setSuccess={setSuccess}
                                                                            setFailure={setFailure} success={success}
                                                                            failure={failure}/>}/>
                <Route path='/login' element={<Login setUser={setUser}/>}/>
                <Route path='*' element={<PageNotFound />}/>
            </Route>
        </Routes>
    </BrowserRouter>
}

function Layout(props: any) {

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const result = await userLogout();
            if (result) {
                props.setUser();
                navigate('/');
            }
        } catch (err) {
            throw new Error(err as string);
        }
    }

    return <div>
        <Navbar className="bg-success fixed-top" variant="dark">
            <Container className="container-fluid d-flex justify-content-between m-0 nav-bar">
                <Navbar.Brand><Link className='nav-link' to='/'><Cart4/>{' '}Rescuing Surplus Food</Link></Navbar.Brand>
                <Navbar.Brand>
                    {
                        (props.user) ? <Navbar.Text>{props.user.name}{' '}<PersonCircle className='ava'/>{' '}<Button
                                variant='danger' onClick={handleLogout}>Logout</Button></Navbar.Text> :
                            <Link to='/login' className='nav-link'><Button variant='light'
                                                                           className='log-in'>Login</Button></Link>
                    }
                </Navbar.Brand>
            </Container>
        </Navbar>
        <Container className="container-fluid m-auto">
            {(props.success) ? <Alert variant='success' className='below-nav1'>Conformation succeed</Alert> : ''}
            {(props.failure) ? <Alert variant='danger' className='below-nav1'>Conformation failed</Alert> : ''}
            <Row className='vheight-100'>
                <Outlet/>
            </Row>
        </Container>
    </div>
}

export default App;
