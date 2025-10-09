import {useEffect, useState} from "react";
import {PageNotFound} from "./PageNotFound.jsx";
import {listBagsByUser, updateBag, getSchedule, updateSchedule} from "./API.js";
import {useNavigate} from "react-router-dom";
import {Alert, Badge, Button, ButtonGroup, Card, Col, Container, Modal, Row} from "react-bootstrap";
import {DashCircleFill} from "react-bootstrap-icons";

function ReservedBags(props) {
    const [bags, setBags] = useState([]);
    const [show, setShow] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [victim, setVictim] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(()=>{
            if (props.user) {
                listBagsByUser(props.user.id).then((bags)=>{
                    setBags(bags);
                }).catch((err)=>{throw new Error(err);});
            } else navigate('/login');
        }, 1000)
    }, [waiting]);

    useEffect(() => {
        setTimeout(()=>{props.setSuccess(false); props.setFailure(false);}, 3000);
    }, [props.success, props.failure]);

    const handleDelete = (bag)=>{
        if (!waiting) {
            setVictim(bag);
            setShow(true);
        }
    }

    const handleConformDelete = async ()=>{
        if (props.user) {
            setWaiting(true);
            getSchedule(victim.id).then((s)=>{
                updateSchedule(victim.id, s.bagId, null, s.establishmentId, null).then((result1)=>{
                    if (result1) {
                        if (result1==='unauthorized') navigate('/login');
                        else if (result1==='failed on update') props.setFailure(true);
                        else {
                            updateBag(victim.id, victim.type, victim.size, (victim.type==='Regular')?victim.content.split(', '):"", 'available', victim.price).then((result2)=>{
                                if (result2) {
                                    if (result2==='unauthorized') navigate('/login');
                                    else if (result2==='failed on update') props.setFailure(true);
                                    else props.setSuccess(true);
                                }
                            }).catch((err)=>{throw new Error(err.message);});
                        }
                    }
                }).catch((err)=>{throw new Error(err.message);});
            }).catch((err)=>{throw new Error(err.message);});
            setBags(await listBagsByUser(props.user.id));
            setShow(false);
            setWaiting(false);
        } else navigate('/login');
    }

    const handleClose = ()=>{
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
        {(props.user)?
            <Alert variant='light' className='reserved-main'>
                <h2 className='establishment-header'>Reserved Bags</h2>
                {(props.user)?<Button className='card-button3' variant='outline-secondary' onClick={()=>{navigate('/')}}>Go to Main</Button>:''}
                <Container className='bags-list'>
                    <Row>
                        {
                            bags.map(b=>
                                <Col key={`${b.id}${b.type}`} className='d-flex justify-content-center mt-5'>
                                    <Card className='bags-card'>
                                        <Card.Body>
                                            <DashCircleFill className='reserved-delete' onClick={()=>{handleDelete(b)}} />
                                            <Card.Title>{b.establishmentName}<br/>{b.type}</Card.Title>
                                            <Badge bg='success'>{b.size}</Badge>
                                            <Card.Text>{(b.type==='Regular')?b.content:""}</Card.Text>
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

export {ReservedBags}