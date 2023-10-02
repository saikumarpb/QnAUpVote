// App.tsx (Enter Room ID Page)
import { Button, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(event.target.value);
    };

    const handleSubmit = () => {
        if (roomId) {
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <div className="flex flex-col gap-2 ">
            <Stack
                component="form"
                sx={{
                    width: '25ch',
                }}
                spacing={2}
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
            >
                <TextField
                    label="Room Id"
                    id="filled-hidden-label-small"
                    variant="outlined"
                    size="small"
                    onChange={handleInputChange}
                    value={roomId}
                />
                <Button variant="outlined" type="submit">
                    Enter room
                </Button>
            </Stack>
        </div>
    );
}

export default App;
