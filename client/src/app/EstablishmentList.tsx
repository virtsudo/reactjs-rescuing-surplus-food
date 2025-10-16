import {Alert, Button, ButtonGroup, Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import type {Establishment} from "../model/AppModel.ts";

export function EstablishmentList(props: any) {
    const navigate = useNavigate();

    const handleSelect = (idEst: number) => {
        if (props.user) {
            props.setTitle(props.establishments.filter((e: Establishment) => e.id == idEst)[0].name);
            navigate(`/bags/${idEst}`);
        } else navigate('/login');
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
        <Alert variant='light' className='establishment-main'>
            <h2 className='establishment-header'>Establishments</h2>
            <Table striped bordered hover>
                <tbody>
                {
                    props.establishments.map((est: Establishment) =>
                        <tr key={est.name} onClick={() => {
                            handleSelect(est.id)
                        }}>
                            <td key={`n${est.id}`}>{est.name}</td>
                            <td key={`a${est.id}`}>{est.address}</td>
                            <td key={`p${est.id}`}>{est.phoneNumber}</td>
                            <td key={`c${est.id}`}>{est.category}</td>
                        </tr>
                    )
                }
                </tbody>
            </Table>
            {(props.user) ?
                <ButtonGroup className='card-button'>
                    <Button variant='success' onClick={handleReservation}>Reservations</Button>
                    {(props.orders.length > 0) ?
                        <Button variant='warning' onClick={handleCard}>Go to Card</Button> : ''}
                </ButtonGroup> : ''}
        </Alert>
    </>
}
