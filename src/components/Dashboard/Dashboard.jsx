import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { RefreshContext } from '../../contextApI/RefreshContext';

const Dashboard = () => {
    const [dataGroup, setDataGroup] = useState({}); // Initialize as an empty object
    const [userAssignedBatch, setUserAssignedBatch] = useState(null); // Track assigned batch
    const [popupMessage, setPopupMessage] = useState(''); // Track popup message
    const navigate = useNavigate();
    const { setRefresh } = useContext(RefreshContext); 
    const { refresh } = useContext(RefreshContext); 
    console.log(refresh, 'from dashboard');
    // Fetch data and group by batch
    async function fetchAndGroupByBatch() {
        try {
            const response = await axiosInstance.get('/dashboard/contacts-by-batch');
            const data = response.data;
            console.log(data, 'abhi ye dekho');
            const groupedData = data.reduce((acc, current) => {
                const batch = current.batchId;
                if (!acc[batch]) {
                    acc[batch] = [];
                }
                acc[batch].push(current);
                return acc;
            }, {});

            setDataGroup(groupedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Handle batch join click
    const handleJoinClick = async (batchId) => {
        try {
            const response = await axiosInstance.get(`/dashboard/check-assigned/${batchId}`);
            const { isAssigned } = response.data;
            console.log(isAssigned, 'checking the other thing');

            if (isAssigned) {
                setUserAssignedBatch(batchId); // Highlight the batch
                setRefresh(prev => {
                    console.log('Updating refresh', !prev); // Check refresh update
                    return !prev;
                });
                console.log(refresh);

                navigate(`/dashboard/${batchId}/join`);

                // Redirect to join
            } else {
                alert('Please end from the previous batch .');
            }
        } catch (error) {
            console.error('Error checking assignment:', error);
        }
    };

    // Handle CSV file upload
    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (event.target.files[0]) {
            const formData = new FormData();
            formData.append('file', event.target.files[0]);

            try {
                const response = await axiosInstance.post('/dashboard/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                alert('File uploaded successfully');
                fetchAndGroupByBatch(); // Refresh data after file upload
            } catch (error) {
                alert('Error uploading file', error.message);
            }
        }
    };
    async function getUser() {
        const isUserAssigned = await axiosInstance.get('/dashboard/isAssigned')
        // console.log(isUserAssigned, 'check here..');
        if (isUserAssigned.data) {
            // console.log(isUserAssigned.data);
            setUserAssignedBatch(isUserAssigned.data.data)
        }
    }

    useEffect(() => {
        fetchAndGroupByBatch();
        getUser()
    }, []);

    return (
        <div className="relative container mx-auto p-4 min-h-[70vh]">
            <h1 className="text-2xl font-bold mb-4">Call Queues</h1>

            {/* Display popup if there's an error */}
            {popupMessage && (
                <div className="mb-4 bg-red-500 text-white p-2 rounded-lg">
                    {popupMessage}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(dataGroup).map(([batchId, contacts]) => (
                    <div
                        key={batchId}
                        className={`rounded-lg  p-4 flex flex-col justify-between bg-purple-400
                        ${userAssignedBatch === batchId ? 'border-[20px] border-green-400' : ''}`}
                    >
                        <div className="flex-grow">
                            <h2 className="text-white text-lg">Batch {batchId}</h2>
                            <p className="text-white"></p>
                        </div>
                        <button
                            onClick={() => handleJoinClick(batchId)}
                            className="mt-2 bg-white text-purple-400 font-bold py-2 px-4 rounded hover:bg-gray-200 transition"
                        >
                            Join
                        </button>
                    </div>
                ))}
            </div>

            {/* Plus Button for CSV Upload */}
            <div className="absolute bottom-0 left-4">
                <label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="bg-purple-400 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-purple-500 transition">
                        <span className="text-8xl font-bold transform -translate-y-[5%]">+</span>
                    </div>
                </label>
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>
        </div>
    );
};

export default Dashboard;
