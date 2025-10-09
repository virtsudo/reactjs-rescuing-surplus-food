import {useEffect, useState} from "react";
import {listBags, updateBag, updateSchedule} from "./API.js";
import {Card, Button, Alert, Row, ButtonGroup, Badge, Modal, Form} from "react-bootstrap";
import {Accordion,useAccordionButton, AccordionCollapse,} from "react-bootstrap";
import {Trash, CaretRightFill} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import {PageNotFound} from "./PageNotFound.jsx";

function ShoppingCard (props) {
    const [userBags, setUserBags] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        listBags([...props.orders.map(o=>o.bagId)]).then((userBags)=>{
            setUserBags(userBags);
        });
    }, [props.orders.length, waiting]);

    useEffect(() => {
        setTimeout(()=>{props.setSuccess(false); props.setFailure(false);}, 3000);
    }, [props.success, props.failure]);

    const handleDelete = (bagId)=>{
        if (props.user) {
            props.setOrders(old=>old.filter(o=>(o.id!==bagId)));
            props.setEstablishments(old=>[...old, props.orders.find(o=>o.id===bagId).establishment].sort((est1, est2)=>est1.name.localeCompare(est2.name)));
            if (props.orders.length===1) navigate('/');
        } else navigate('/login');
    }

    const handleConform = ()=>{
        if (props.user) {
            setWaiting(true);
            props.orders.map((o)=>{
                updateSchedule(o.id, o.bagId, props.user.id, o.establishmentId, o.pickupTime).then((result1)=>{
                    if (result1) {
                        if (result1==='unauthorized') navigate('/login');
                        else if (result1==='failed on update') props.setFailure(true);
                        else {
                            userBags.map((b)=>{
                                updateBag(b.id, b.type, b.size, b.content, 'reserved', b.price).then((result2)=>{
                                    if (result2) {
                                        if (result2==='unauthorized') navigate('/login');
                                        else if (result1==='failed on update') props.setFailure(true);
                                        else props.setSuccess(true);
                                    }
                                }).catch((err)=>{throw new Error(err.message);});
                            });
                        }
                    }
                }).catch((err)=>{throw new Error(err.message);});
            });
            props.setOrders([]);
            setShow(false);
            setWaiting(false);
            navigate(`/${props.user.id}/reserved-bags`);
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
                <Button variant='success' onClick={handleConform}>Conform</Button>
                <Button variant='secondary' onClick={handleClose}>Cancel</Button>
            </ButtonGroup>
        </Modal>
        {
            (props.user)?
                <Alert variant='light' className='shopping-card-main'>
                    <h1 className='shopping-card-header'>Shopping Card</h1>
                    <Accordion defaultValue={0} className='d-grid gap-2'>
                        {
                            userBags.map(ub =>
                                (ub.type==='Surprise')?
                                    <ButtonGroup className='d-flex' key={`${ub.id}-${ub.type}`}>
                                        <Button variant='danger' disabled={waiting} onClick={()=>{handleDelete(ub.id)}}><Trash /></Button>
                                        <Button className='shopping-card-item w-100' disabled>
                                            <Row className='d-flex align-content-center justify-content-center'>
                                                <p className='col text-start m-0'>{`${ub.type} `}<Badge bg='success' className='shopping-card-badge'>{ub.size}</Badge><CaretRightFill/>{ub.establishmentName}</p>
                                                <p className='col-auto m-0' bg={'green'}>{`Total: €${ub.price}`}</p>
                                            </Row>
                                        </Button>
                                    </ButtonGroup>:
                                    <Card key={`${ub.id}-${ub.type}`}>
                                        <AccordionEffect eventKey={ub.id} children={{bag: ub, action: handleDelete, disable: waiting}}/>
                                        <RegularFoods ub={ub} setBags={setUserBags} disabled={waiting} />
                                    </Card>
                            )
                        }
                        {(props.orders.length>0)?<Button variant='success' disabled={waiting} onClick={()=>{setShow(true)}}>Confirm</Button>:''}
                    </Accordion>
                    {(props.user && props.orders.length>0)?<Button className='card-button2' variant='outline-secondary' onClick={()=>{navigate('/')}}>Go to Main</Button>:''}
                </Alert>:<PageNotFound />
        }
    </>
}

function RegularFoods (props) {
    const {ub, setBags} = props;
    const [contents, setContents] = useState([]);
    const [count, setCount] =useState(0);

    useEffect(() => {
        setContents(ub.content);
    }, [ub.id]);

    const handleDelete = (content)=>{
        setContents(old=>{
            return old.filter(c=>(c!==content));
        });
        setBags(old=>{
            return old.map(b=>{
                if (b.id===ub.id) b.content=b.content.filter(c=>(c!==content));
                return b;
            });
        });
        setCount(prevState => prevState+1);
    }

    return <AccordionCollapse eventKey={ub.id}>
        <Card.Body className='d-grid gap-2'>
            <p className='shopping-card-alert'>You can delete maximum 2 foods!</p>
            {
                contents.map(c =>
                    <ButtonGroup className='d-flex' key={`${ub.id}-${c}`}>
                        {(count<2)? <Button variant='danger' disabled={props.disabled} onClick={()=>{handleDelete(c)}}><Trash/></Button>:''}
                        <Button className='shopping-card-item w-100' disabled>
                            <Row
                                className='d-flex align-content-center justify-content-center'>
                                <p className='col text-start m-0'>{c}</p>
                            </Row>
                        </Button>
                    </ButtonGroup>
                )
            }
        </Card.Body>
    </AccordionCollapse>
}

function AccordionEffect({children, eventKey}) {
    const decorationOnClick = useAccordionButton(eventKey, ()=>{});
    return <ButtonGroup className='d-flex' onClick={decorationOnClick}>
        <Button variant='danger' disabled={children.disable} onClick={()=>{children.action(children.bag.id)}}><Trash /></Button>
        <Button className='shopping-card-item w-100' disabled key={`${children.bag.id}-${children.bag.type}`}>
            <Row className='d-flex align-content-center justify-content-center'>
                <p className='col text-start m-0'>{`${children.bag.type} `}<Badge bg='success' className='shopping-card-badge'>{children.bag.size}</Badge><CaretRightFill/>{children.bag.establishmentName}</p>
                <p className='col-auto m-0' bg={'green'}>{`Total: €${children.bag.price}`}</p>
            </Row>
        </Button>
    </ButtonGroup>
}

export {ShoppingCard}
