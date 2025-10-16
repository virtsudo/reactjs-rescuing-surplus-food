import {Alert, Button, Form} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {User} from "../model/AppModel.ts";
import {userLogin} from "../api/API.ts";


export function Login(props: any) {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        // @ts-ignore
        setTimeout(() => setMessage(), 3000)
    }, [message]);

    const handleSubmit = async () => {
        try {
            const user: User | string = await userLogin(username, password);
            if (user) {
                if (user === 'unauthorized') setMessage('incorrect username or password');
                else {
                    props.setUser(user);
                    navigate('/');
                }
            }
        } catch (err) {
            if (err instanceof Error) setMessage(err.message);
            else setMessage(String(err));
        }
    }

    return <Alert variant='light' className='login'>
        <Form>
            <h2 className='login-header'>Login</h2>
            <Form.Group className='mb-3' controlId="username1">
                <Form.Label>Username</Form.Label>
                <Form.Control type='email' placeholder="Enter username" onChange={(ev) => {
                    setUsername(ev.target.value)
                }}/>
            </Form.Group>
            <Form.Group className='mb-3 login-entry' controlId="password1">
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' placeholder='Password' onChange={(ev) => {
                    setPassword(ev.target.value)
                }}/>
                {(message) ? <h6 className='login-message'>{message}</h6> : ''}
            </Form.Group>
            <Form.Group className='d-grid'>
                <Button variant='outline-success' disabled={(message !== undefined)}
                        onClick={handleSubmit}>Login</Button>
            </Form.Group>
        </Form>
    </Alert>
}
