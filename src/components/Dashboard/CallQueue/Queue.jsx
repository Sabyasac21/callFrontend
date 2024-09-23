import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { Button } from 'antd';
import { RefreshContext } from '../../../contextApI/RefreshContext';

const CallsComponent = () => {
    const navigate = useNavigate()
    const params = useParams();
    const batchId = params.id;
    const [contacts, setContacts] = useState({
        unassigned: [],
        myCalls: [],
        completed: [],
        assigned: []
    });
    const {refresh} = useContext(RefreshContext)
    console.log(refresh, 'from queue..');

    const handleComplete = async (callId) => {
        try {
            // 1. Update contact status to "completed"
            await axiosInstance.put(`/dashboard/contacts/${callId}`, { status: 'completed' });

            // 2. Set the user's "assigned" field to null
            await axiosInstance.put('/user/assign', { assigned: null });

            // 3. Update the UI by fetching contacts again
            const updatedContacts = contacts.myCalls.filter(contact => contact._id !== callId);
            const assignedCotacts = contacts.assigned.filter(contact=>contact._id!== callId)
            const completedContact = contacts.myCalls.find(contact => contact._id === callId);

            // Move the contact to "completed" section
            setContacts({
                ...contacts,
                myCalls: updatedContacts,

                completed: [...contacts.completed, completedContact],
                assigned:assignedCotacts
            });
            alert('Contact processed')
            setTimeout(()=>{
                alert('refresh the screen to assigna contact')

            }, 1000)
            
        } catch (error) {
            console.error('Error completing the call:', error);
        }
    };

    const leaveProcess = async()=>{
        await axiosInstance.post('/dashboard/leave-process')
        alert('Process Terminated')
        navigate('/dashboard')
    }

    // Fetch contacts by batchId
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                console.log(localStorage.getItem('auth'), 'token is here...');
                const response = await axiosInstance.get(`/dashboard/contacts/${batchId}`);
                const queData = response.data;
                console.log(queData, 'checking response of the whole batchId');



                const groupedContacts = {
                    unassigned: [],
                    myCalls: [],
                    completed: [],
                    assigned: []
                };

                // Sort contacts into their respective groups
                queData.forEach(contact => {
                    if (contact.status === 'unassigned') {
                        groupedContacts.unassigned.push(contact);
                    } else if (contact.status === 'assigned') {
                        groupedContacts.assigned.push(contact);
                    } else if (contact.status === 'completed') {
                        groupedContacts.completed.push(contact);
                    } else {
                        groupedContacts.myCalls.push(contact);
                    }
                });


                const userResponse = await axiosInstance.get('/user')
                console.log(userResponse, 'from frontend');
                const user = userResponse.data
                console.log(user, 'checking the user..');
                // console.log(user.assigned, 'see user details');
                if (user.assigned === null) {
                    console.log(' user not assigned yet...');
                    const firstContact = groupedContacts.unassigned[0];
                    console.log(firstContact, 'check the first contact');
                    const userAssignedResponse = await axiosInstance.put('/user/assign', { assigned: firstContact._id })
                    console.log(userAssignedResponse.data, 'checking the user assigned response');

                    // firstContact.status = 'assigned';
                    groupedContacts.unassigned.shift();
                    groupedContacts.myCalls.push(firstContact)
                    groupedContacts.assigned.push(firstContact)
                    const contactUpdateResponse = await axiosInstance.put(`/dashboard/contacts/${firstContact._id}`, { status: 'assigned' });
                    console.log(contactUpdateResponse.data, 'checking if the contact updated or not...');

                } else {
                    console.log('zingo');
                    const contactResponse = await axiosInstance.get('/user/asignee')
                    console.log(contactResponse.data, 'from outer...');
                    // groupedContacts.unassigned.shift();
                    groupedContacts.myCalls.push(contactResponse.data)
                    // groupedContacts.assigned.push(contactResponse.data)
                }

                setContacts(groupedContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };
        fetchContacts();
    }, [batchId]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 flex justify-center">Call Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Unassigned Calls Section */}
                <div className="bg-purple-400 p-4 rounded-lg">
                    <h2 className="text-white text-2xl font-bold text-center mb-4">Unassigned Calls</h2>
                    {contacts.unassigned.map((call, index) => (
                        <div key={index} className="text-white mb-4">
                            <div className="flex justify-between">
                                <p className='text-purple-800 text-xl font-bold'>{call.name}</p>
                                <p className='text-gray-900'>{call.phoneNumber}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Assigned Calls Section */}
                <div className="bg-red-200 p-4 rounded-lg">
                    <h2 className="text-white text-2xl font-bold text-center mb-4">Assigned Calls</h2>
                    {contacts.assigned.map((call, index) => (
                        <div key={index} className="text-white mb-4">
                            <div className="flex justify-between">
                                <p className='text-purple-800 text-xl font-bold'>{call.name}</p>
                                <p className='text-gray-900'>{call.phoneNumber}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Completed Calls Section */}
                <div className="bg-green-400 p-4 rounded-lg">
                    <h2 className="text-white text-2xl font-bold text-center mb-4">Completed Calls</h2>
                    {contacts.completed.map((call, index) => (
                        <div key={index} className="text-white mb-4">
                            <div className="flex justify-between">
                                <p className='text-purple-800 text-xl font-bold'>{call.name}</p>
                                <p className='text-gray-900'>{call.phoneNumber}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* My Calls Section */}
                <div className="bg-blue-400 p-4 rounded-lg">
                    <h2 className="text-white text-2xl font-bold text-center mb-4">My Calls</h2>
                    {contacts.myCalls.map((call, index) => (
                        <div key={index} className="text-white mb-4">
                            <div className="flex justify-between">
                                <p className='text-purple-800 text-xl font-bold'>{call.name}</p>
                                <p className='text-gray-900'>{call.phoneNumber}</p>
                                <Button onClick={()=>handleComplete(call._id)}>Complete</Button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <div className='pt-12'>
                <button onClick={leaveProcess} className='border border-gray-700 rounded-md py-2 px-4 hover:border-red-300 hover:bg-red-100 hover:bg-opacity-55'>Leave Process</button>
            </div>
        </div>
    );
};

export default CallsComponent;
