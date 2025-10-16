import {Alert, Badge, Button, ButtonGroup, Card, Col, Container, Form, ListGroup, Modal, Row} from "react-bootstrap";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import type {Establishment, Bag, Schedule} from "../model/AppModel.ts";
import {listBagsByEstablishment} from "../api/API.ts";
import {PageNotFound} from "../absent/PageNotFound.tsx";


export function BagsPage(props: any) {
    const navigate = useNavigate();
    const {idEstablishment} = useParams();
    const [select, setSelect] = useState<number>(Number(idEstablishment));

    const handleSelect = (idEstablishment: number) => {
        setSelect(idEstablishment);
        props.setTitle(props.establishments.filter((e: Establishment) => e.id == idEstablishment)[0].name);
        navigate(`/bags/${idEstablishment}`);
    }

    useEffect(() => {
        listBagsByEstablishment(select).then((bags: Array<Bag> | string) => {
            if (bags==='unauthorized') navigate('/login');
            props.setBags(bags as Array<Bag>);
        });
    }, [select]);

    return <>
        {
            (props.user) ? (<>
                <Col className='col-3 bg-light below-nav vheight-100 bags-side' id='left-sidebar'>
                    <ListGroup variant='flush'>
                        {
                            props.establishments.map((e: Establishment) =>
                                <ListGroup.Item action active={(e.id == select)} key={e.name} onClick={() => {
                                    handleSelect(e.id)
                                }}>{e.name}</ListGroup.Item>
                            )
                        }
                    </ListGroup>
                </Col>
                <Col className='col-9 below-nav bags-main'>
                    <Outlet/>
                </Col>
            </>) : (<PageNotFound />)
        }
    </>
}

export function BagsList(props: any) {

    const navigate = useNavigate();
    const [show, setShow] = useState<boolean>(false);
    const [id, setId] = useState<number>(-1);
    const [time, setTime] = useState(dayjs().format('HH:mm'));
    const [waiting, setWaiting] = useState<boolean>(false);

    const handleSelect = (bag: Bag) => {
        if (bag.state === 'available') {
            setId(bag.id);
            setShow(true);
        }
    }

    const handleSubmit = async () => {
        if (props.user) {
            setWaiting(true);
            const schedule: Schedule = props.schedules.find((s: Schedule) => (s.id === id));
            schedule.userId = props.user.id;
            schedule.pickupTime = time;
            props.setOrders((old: Array<Schedule>) => [...old, schedule]);
            props.setEstablishments((old: Array<Establishment>) => {
                return old.filter((o: any) => o.id !== schedule.establishmentId);
            });
            setShow(false);
            setWaiting(false);
            navigate(`/`);
        } else navigate('/login');
    }

    const handleClose = () => {
        setShow(false);
    }

    const handleChange = (ev: any) => {
        if (dayjs(`${dayjs().format('YYYY-MM-DD')}T${ev.target.value}:${dayjs().format('ssZ')}`).diff(dayjs(), 'seconds') > 0)
            setTime(ev.target.value);
    }

    const handleCard = () => {
        if (props.user) {
            navigate(`/${props.user.id}/shopping-card`);
        } else navigate('/login');
    }

    const handleReservation = () => {
        if (props.user) {
            navigate(`/${props.user.id}/reserved-bags`);
        } else navigate('/login');
    }

    return <>
        <Modal aria-labelledby="contained-modal-title-vcenter" centered show={show}>
            <Modal.Header className='bags-modal'>
                <Modal.Title>Pick Up Time Selection</Modal.Title>
            </Modal.Header>
            <Modal.Body className='d-flex justify-content-center'>
                <Form className='bags-modal-entry'>
                    <Form.Group controlId='pickup-time'>
                        <Form.Control type='time' value={time} onChange={handleChange}/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className='bags-modal'>
                <ButtonGroup>
                    <Button variant='success' disabled={waiting} onClick={handleSubmit}>Submit</Button>
                    <Button variant='secondary' disabled={waiting} onClick={handleClose}>Cancel</Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
        <h1 className='bags-header'>{props.title}</h1>
        <Alert variant='light'>
            <Container className='bags-list'>
                <Row>
                    {
                        props.bags.filter((b: Bag) => b.type === 'Surprise').map((b: Bag) =>
                            <Col key={`${b.id}${b.type}`} className='d-flex justify-content-center mb-5'>
                                <Card className={(b.state === 'available') ? 'bags-card' : 'bags-card-danger'}
                                      onClick={() => {
                                          handleSelect(b)
                                      }}>
                                    <Card.Body>
                                        <Card.Title>{b.type}</Card.Title>
                                        <Badge bg={(b.state === 'available') ? 'success' : 'danger'}>{b.size}</Badge>
                                    </Card.Body>
                                    <Card.Footer
                                        className={(b.state === 'available') ? 'bags-card-footer' : 'bags-card-footer-danger'}>
                                        <Card.Text className='text-end'>{`Total: € ${b.price}`}</Card.Text>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    }
                </Row>
                <Row>
                    {
                        props.bags.filter((b: Bag) => b.type === 'Regular').map((b: Bag) =>
                            <Col key={`${b.id}${b.type}`} className='d-flex justify-content-center mt-5'
                                 onClick={() => {
                                     handleSelect(b)
                                 }}>
                                <Card className={(b.state === 'available') ? 'bags-card' : 'bags-card-danger'}>
                                    <Card.Body>
                                        <Card.Title>{b.type}</Card.Title>
                                        <Badge bg={(b.state === 'available') ? 'success' : 'danger'}>{b.size}</Badge>
                                        <Card.Text>{b.content}</Card.Text>
                                    </Card.Body>
                                    <Card.Footer
                                        className={(b.state === 'available') ? 'bags-card-footer' : 'bags-card-footer-danger'}>
                                        <Card.Text className='text-end'>{`Total: € ${b.price}`}</Card.Text>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    }
                </Row>
            </Container>
            {(props.user) ?
                <ButtonGroup className='card-button1'>
                    <Button variant='success' onClick={handleReservation}>Reservations</Button>
                    {(props.orders.length > 0) ?
                        <Button variant='warning' onClick={handleCard}>Go to Card</Button> : ''}
                </ButtonGroup> : ''}
        </Alert>
    </>
}
