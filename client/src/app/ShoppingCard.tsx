import {Accordion, useAccordionButton, AccordionCollapse,} from "react-bootstrap";
import {Card, Button, Alert, Row, ButtonGroup, Badge, Modal} from "react-bootstrap";
import {Trash, CaretRightFill} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Bag, Establishment, Schedule} from "../model/AppModel.ts";
import {listBags, updateBag, updateSchedule, getEstablishment} from "../api/API.ts";
import {PageNotFound} from "../absent/PageNotFound.tsx";


export function ShoppingCard(props: any) {
    const [userBags, setUserBags] = useState<Array<Bag>>([]);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        listBags([...props.orders.map((o: Schedule) => o.bagId)]).then((userBags: Array<Bag> | string) => {
            if (userBags==='unauthorized') navigate('/login');
            setUserBags(userBags as Array<Bag>);
        });
    }, [props.orders.length, waiting]);

    useEffect(() => {
        setTimeout(() => {
            props.setSuccess(false);
            props.setFailure(false);
        }, 3000);
    }, [props.success, props.failure]);

    const handleDelete = (bagId: number) => {
        if (props.user) {
            getEstablishment(props.orders.find((o: Schedule) => o.id === bagId).establishmentId).then((est: Establishment | string) => {
                if (est==='unauthorized') navigate('/login');
                props.setEstablishments((old: Array<Establishment>) => [...old, est as Establishment].sort((est1, est2) => est1.name.localeCompare(est2.name)));
            });
            props.setOrders((old: Array<Schedule>) => old.filter((o: Schedule) => (o.id !== bagId)));
            if (props.orders.length === 1) navigate('/');
        } else navigate('/login');
    }

    const handleConform = () => {
        if (props.user) {
            setWaiting(true);
            props.orders.map((o: Schedule) => {
                updateSchedule(o.id, o.bagId, props.user.id, o.establishmentId, o.pickupTime).then((result1: boolean | string) => {
                    if (result1) {
                        if (result1 === 'unauthorized') navigate('/login');
                        else if (result1 === 'failed on update') props.setFailure(true);
                        else {
                            userBags.map((b: Bag) => {
                                updateBag(b.id, b.type, b.size, b.content, 'reserved', b.price).then((result2: boolean | string) => {
                                    if (result2) {
                                        if (result2 === 'unauthorized') navigate('/login');
                                        else if (result1 === 'failed on update') props.setFailure(true);
                                        else props.setSuccess(true);
                                    }
                                }).catch((err: any) => {
                                    throw new Error(err.message);
                                });
                            });
                        }
                    }
                }).catch((err: any) => {
                    throw new Error(err.message);
                });
            });
            props.setOrders([]);
            setShow(false);
            setWaiting(false);
            navigate(`/${props.user.id}/reserved-bags`);
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
                <Button variant='success' onClick={handleConform}>Conform</Button>
                <Button variant='secondary' onClick={handleClose}>Cancel</Button>
            </ButtonGroup>
        </Modal>
        {
            (props.user) ?
                <Alert variant='light' className='shopping-card-main'>
                    <h1 className='shopping-card-header'>Shopping Card</h1>
                    <Accordion defaultValue={0} className='d-grid gap-2'>
                        {
                            userBags.map(ub =>
                                (ub.type === 'Surprise') ?
                                    <ButtonGroup className='d-flex' key={`${ub.id}-${ub.type}`}>
                                        <Button variant='danger' disabled={waiting} onClick={() => {
                                            handleDelete(ub.id)
                                        }}><Trash/></Button>
                                        <Button className='shopping-card-item w-100' disabled>
                                            <Row className='d-flex align-content-center justify-content-center'>
                                                <p className='col text-start m-0'>{`${ub.type} `}<Badge bg='success'
                                                                                                        className='shopping-card-badge'>{ub.size}</Badge><CaretRightFill/>{ub.establishmentName}
                                                </p>
                                                <p className='col-auto m-0'>{`Total: €${ub.price}`}</p>
                                            </Row>
                                        </Button>
                                    </ButtonGroup> :
                                    <Card key={`${ub.id}-${ub.type}`}>
                                        <AccordionEffect eventKey={ub.id}
                                                         children={{bag: ub, action: handleDelete, disable: waiting}}/>
                                        <RegularFoods ub={ub} setBags={setUserBags} disabled={waiting}/>
                                    </Card>
                            )
                        }
                        {(props.orders.length > 0) ? <Button variant='success' disabled={waiting} onClick={() => {
                            setShow(true)
                        }}>Confirm</Button> : ''}
                    </Accordion>
                    {(props.user && props.orders.length > 0) ?
                        <Button className='card-button2' variant='outline-secondary' onClick={() => {
                            navigate('/')
                        }}>Go to Main</Button> : ''}
                </Alert>:<PageNotFound />
        }
    </>
}

function RegularFoods(props: any) {
    const {ub, setBags} = props;
    const [contents, setContents] = useState<Array<string>>([]);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        setContents(ub.content);
    }, [ub.id]);

    const handleDelete = (content: string) => {
        setContents(old => {
            return old.filter(c => (c !== content));
        });
        setBags((old: Array<Bag>) => {
            return old.map((b: Bag) => {
                if (b.id === ub.id) b.content = b.content?.filter(c => (c !== content)) || null;
                return b;
            });
        });
        setCount(prevState => prevState + 1);
    }

    return <AccordionCollapse eventKey={ub.id}>
        <Card.Body className='d-grid gap-2'>
            <p className='shopping-card-alert'>You can delete maximum 2 foods!</p>
            {
                contents.map(c =>
                    <ButtonGroup className='d-flex' key={`${ub.id}-${c}`}>
                        {(count < 2) ? <Button variant='danger' disabled={props.disabled} onClick={() => {
                            handleDelete(c)
                        }}><Trash/></Button> : ''}
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

// @ts-ignore
function AccordionEffect({children, eventKey}) {
    const decorationOnClick = useAccordionButton(eventKey, () => {
    });
    return <ButtonGroup className='d-flex' onClick={decorationOnClick}>
        <Button variant='danger' disabled={children.disable} onClick={() => {
            children.action(children.bag.id)
        }}><Trash/></Button>
        <Button className='shopping-card-item w-100' disabled key={`${children.bag.id}-${children.bag.type}`}>
            <Row className='d-flex align-content-center justify-content-center'>
                <p className='col text-start m-0'>{`${children.bag.type} `}<Badge bg='success'
                                                                                  className='shopping-card-badge'>{children.bag.size}</Badge><CaretRightFill/>{children.bag.establishmentName}
                </p>
                <p className='col-auto m-0'>{`Total: €${children.bag.price}`}</p>
            </Row>
        </Button>
    </ButtonGroup>
}
