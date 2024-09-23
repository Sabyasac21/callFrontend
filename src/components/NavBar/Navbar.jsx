import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { io } from 'socket.io-client';

const Navbar = () => {
    const token = localStorage.getItem('auth');
    // const [dataGroup, setDataGroup] = useState({});
    const location = useLocation();
    const address = location.pathname;
    const [queuesCount, setQueuesCount] = useState(0);
    const [completed, setCompletedCount] = useState(0);
    const [assigned, setAssignedCount] = useState(0);
    const [unassigned, setUnassignedCount] = useState(0);
    const navigate = useNavigate()


    // https://call-backend.onrender.com
    // 'http://localhost:3002/api'
    const socket = io('http://localhost:3002');
    // console.log(refresh, 'from navbar');
    async function fetchAndGroupByBatch() {
        try {
            const response = await axiosInstance.get('/dashboard/contacts-by-batch');
            const data = response.data;

            let unassignedCount = 0;
            let assignedCount = 0;
            let completedCount = 0;

            const groupedData = data.reduce((acc, current) => {
                const batch = current.batchId;

                // Count status
                if (current.status === 'unassigned') {
                    unassignedCount++;
                } else if (current.status === 'assigned') {
                    assignedCount++;
                } else {
                    completedCount++;
                }

                if (!acc[batch]) {
                    acc[batch] = [];
                }
                acc[batch].push(current);

                return acc;
            }, {});

            // Update the state with calculated counts
            setCompletedCount(completedCount);
            setUnassignedCount(unassignedCount);
            setAssignedCount(assignedCount);

            // setDataGroup(groupedData);
            setQueuesCount(Object.keys(groupedData).length); // Ensure you're using groupedData here
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('auth')
        navigate('/login')

    }

    useEffect(() => {
        fetchAndGroupByBatch();
        // Listen for the 'contacts-updated' event from the server
        socket.on('contacts-updated', () => {
            console.log('Contacts updated, refreshing...');
            fetchAndGroupByBatch(); // Refresh the contact counts when the event is received
        });

        return () => {
            socket.off('contacts-updated'); // Clean up the socket listener on component unmount
        };
    }, [location]);

    return (
        <nav className="bg-purple-400 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to='/dashboard'>
                    <div className="text-white text-lg font-bold">
                        CallManager
                    </div>
                </Link>

                {!token && (
                    <div>
                        <Link to="/login" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Login
                        </Link>
                        <Link to="/register" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Register
                        </Link>
                    </div>
                )}

                {token && (
                    <div>
                        <span to="/dashboard" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Queues<span className='text-green-400 font-bold text-2xl'>{queuesCount}</span>
                        </span>
                        <span to="/dashboard" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Assigned <span className='text-green-400 font-bold text-2xl'>{assigned}</span>
                        </span>
                        <span to="/dashboard" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Unassigned <span className='text-green-400 font-bold text-2xl'>{unassigned}</span>
                        </span>
                        <span to="/dashboard" className="text-white px-4 py-2 rounded hover:bg-purple-500 transition">
                            Completed <span className='text-green-400 font-bold text-2xl'>{completed}</span>
                        </span>
                        <a onClick={handleLogout} className='text-grey-400 text-2xl' href='/login'>Logout</a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
