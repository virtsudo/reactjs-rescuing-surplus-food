import {Alert, Badge, Button, ButtonGroup, Card, Col, Container, Modal, Row} from "react-bootstrap";
import {DashCircleFill} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Bag, Establishment, Schedule} from "../model/AppModel.ts";
import {getEstablishment, listBagsByUser, updateBag, updateSchedule} from "../api/API.ts";
import {PageNotFound} from "../absent/PageNotFound.tsx";


export function ReservedBags(props: any) {
    const [bags, setBags] = useState<Array<Bag>>([]);
    const [show, setShow] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [victim, setVictim] = useState<Bag>();
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            if (props.user) {
                listBagsByUser(props.user.id).then((bags: Array<Bag> | string) => {
                    if (bags==='unauthorized') navigate('/login');
                    setBags(bags as Array<Bag>);
                }).catch((err: any) => {
                    throw new Error(err);
                });
            } else navigate('/login');
        }, 1000)
    }, [waiting]);

    useEffect(() => {
        setTimeout(() => {
            props.setSuccess(false);
            props.setFailure(false);
        }, 3000);
    }, [props.success, props.failure]);

    const handleDelete = (bag: Bag) => {
        if (!waiting) {
            setVictim(bag);
            setShow(true);
        }
    }

    const handleConformDelete = async () => {
        if (props.user) {
            setWaiting(true);
            const schedule: Schedule = props.schedules.find((s: Schedule) => (s.id === victim?.id))
            // @ts-ignore
            updateSchedule(victim.id, schedule.bagId, null, schedule.establishmentId, null).then((result1: boolean | string) => {
                if (result1) {
                    if (result1 === 'unauthorized') navigate('/login');
                    else {
                        // @ts-ignore
                        updateBag(victim.id, victim.type, victim.size, (victim.type === 'Regular') ? victim.content.split(', ') : null, 'available', victim.price).then((result2: boolean | string) => {
                            if (result2) {
                                getEstablishment(schedule.establishmentId).then((est: Establishment | string) => {
                                    if (est==='unauthorized') navigate('/login');
                                    props.setEstablishments((old: Array<Establishment>) => [...old, est as Establishment].sort((est1, est2) => est1.name.localeCompare(est2.name)));
                                });
                                if (result2 === 'unauthorized') navigate('/login');
                                else props.setSuccess(true);
                            }
                        }).catch((err: any) => {
                            throw new Error(err.message);
                        });
                    }
                }
            }).catch((err: any) => {
                throw new Error(err.message);
            });
            listBagsByUser(props.user.id).then((bags: Array<Bag> | string) => {
                if (bags==='unauthorized') navigate('/login');
                setBags(bags as Array<Bag>);
            })
            setShow(false);
            setWaiting(false);
        } else navigate('/login');
    }

    const handleClose = () => {
        setShow(false);
    }

    return <>
        <Modal aria-labelledby="contained-modal-title-vcenter" centered show={show}>
            <Modal.Body className='d-flex justify-content-center'>
                <h1>Are you sure ?</h1>
            </Modal.Body>
            <ButtonGroup className='modal-footer'>
                <Button variant='danger' disabled={waiting} onClick={handleConformDelete}>Delete</Button>
                <Button variant='secondary' disabled={waiting} onClick={handleClose}>Cancel</Button>
            </ButtonGroup>
        </Modal>
        {(props.user) ?
            <Alert variant='light' className='reserved-main'>
                <h2 className='establishment-header'>Reserved Bags</h2>
                {(props.user) ? <Button className='card-button3' variant='outline-secondary' onClick={() => {
                    navigate('/')
                }}>Go to Main</Button> : ''}
                <Container className='bags-list'>
                    <Row>
                        {
                            bags.map(b =>
                                <Col key={`${b.id}${b.type}`} className='d-flex justify-content-center mt-5'>
                                    <Card className='bags-card'>
                                        <Card.Body>
                                            <DashCircleFill className='reserved-delete' onClick={() => {
                                                handleDelete(b)
                                            }}/>
                                            <Card.Title>{b.establishmentName}<br/>{b.type}</Card.Title>
                                            <Badge bg='success'>{b.size}</Badge>
                                            <Card.Text>{(b.type === 'Regular') ? b.content : ""}</Card.Text>
                                        </Card.Body>
                                        <Card.Footer className='bags-card-footer'>
                                            <Card.Text className='text-end col-auto'>{`Total: € ${b.price}`}</Card.Text>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            )
                        }
                    </Row>
                </Container>
            </Alert>
            :<PageNotFound />}
    </>
}
