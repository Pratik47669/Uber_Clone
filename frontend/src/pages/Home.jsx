import React, { useContext, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import { SocketContext } from '../context/SocketContext'
import {UserDataContext} from '../context/UserContext'
import LiveTracking from '../components/LiveTracking'

const Home = () => {
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [panelOpen, setPanelOpen] = useState(false)
    const VehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const lookingForDriverRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const timeoutRef = useRef(null);
    const panelCloseRef = useRef(null)
    const [vehiclePanel, setVehiclePanel] = useState(false)
    const [confirmRidePanel, setConfirmRidePanel] = useState(false)
    const [vehicleFound, setVehicleFound] = useState(false)
    const [lookingForDriver, setLookingForDriver] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false)
    const [pickupSuggestions, setPickupSuggestions] = useState([])
    const [destinationSuggestions, setDestinationSuggestions] = useState([])
    const [activeField, setActiveField] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)
    const navigate = useNavigate();
  

    const{ socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

useEffect(() => {
    console.log("Checking User Context:", user);

    // 🚀 Change: yahan user.user._id check karo
    const userId = user?._id || user?.user?._id; 

    if (socket && userId) {
        socket.emit("join", { 
            userId: userId, 
            role: 'user' 
        });
        console.log("🚀 User Room Joined Successfully:", userId);
    } else {
        console.log("⚠️ Room join nahi hua kyunki ID missing hai!");
    }
}, [user, socket]);


    useEffect(() => {
  console.log("lookingForDriver:", lookingForDriver);
  console.log("waitingForDriver:", waitingForDriver);
}, [lookingForDriver, waitingForDriver]);


    socket.on('ride-started', ride => {
        console.log("ride")
        setWaitingForDriver(false)
        navigate('/riding', { state: { ride } }) 
    })

 useEffect(() => {
  if (!socket) return;

  socket.on("ride-confirmed", (rideData) => {
    console.log("✅ Ride confirmed:", rideData);

    setRide(rideData);
    setLookingForDriver(false);   // searching band
    setWaitingForDriver(true);    // waiting panel open
    setConfirmRidePanel(false);
  setVehiclePanel(false);
  setPanelOpen(false);
  });

  return () => {
    socket.off("ride-confirmed");
  };
}, [socket]);



const handlePickupChange = async (e) => {
    const value = e.target.value
    setPickup(value)
    setActiveField('pickup')

    if (value.trim().length < 3) {
        setPickupSuggestions([])
        return
    }

   
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            setPickupSuggestions(response.data)
        } catch (err) {
            console.error('Pickup suggestions error:', err)
        }
    }, 700) 
}

const handleDestinationChange = async (e) => {
    const value = e.target.value
    setDestination(value)
    setActiveField('destination')

    if (value.trim().length < 3) {
        setDestinationSuggestions([])
        return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            setDestinationSuggestions(response.data)
        } catch (err) {
            console.error('Destination suggestions error:', err)
        }
    }, 700)
}
    

    // const handlePickupChange = async (e) => {
    //     const value = e.target.value
    //     setPickup(value)
    //     setActiveField('pickup')

    //     if (value.trim().length < 2) {
    //         setPickupSuggestions([])
    //         return
    //     }

    //     try {
    //         const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
    //             params: { input: value },
    //             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //         })

    //         const suggestions = Array.isArray(response.data) ? response.data : response.data.suggestions || []
    //         setPickupSuggestions(suggestions)
    //     } catch (err) {
    //         console.error('Pickup suggestions error:', err)
    //         setPickupSuggestions([])
    //     }
    // }

    // const handleDestinationChange = async (e) => {
    //     const value = e.target.value
    //     setDestination(value)
    //     setActiveField('destination')

    //     if (value.trim().length < 2) {
    //         setDestinationSuggestions([])
    //         return
    //     }

    //     try {
    //         const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
    //             params: { input: value },
    //             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    //         })

    //         const suggestions = Array.isArray(response.data) ? response.data : response.data.suggestions || []
    //         setDestinationSuggestions(suggestions)
    //     } catch (err) {
    //         console.error('Destination suggestions error:', err)
    //         setDestinationSuggestions([])
    //     }
    // }

    const submitHandler = (e) => e.preventDefault()

    // GSAP animations
       useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])


    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(VehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(VehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePanel ])

useEffect(() => {
  if (!lookingForDriverRef.current) return;

  gsap.set(lookingForDriverRef.current, { yPercent: 100 }); // default hidden

  if (lookingForDriver) {
    gsap.to(lookingForDriverRef.current, {
      yPercent: 0,
      duration: 0.4,
      ease: "power2.out"
    });
  } else {
    gsap.to(lookingForDriverRef.current, {
      yPercent: 100,
      duration: 0.4,
      ease: "power2.out"
    });
  }
}, [lookingForDriver]);

useGSAP(function () {
    if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
            transform: 'translateY(0)',
            duration: 0.5,
            ease: "power2.out"
        })
    } else {
        gsap.to(waitingForDriverRef.current, {
            transform: 'translateY(100%)'
        })
    }
}, [ waitingForDriver ])

        async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)
        setVehicleFound(false)
        setConfirmRidePanel(false)

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        console.log(response.data)  
        setFare(response.data)


    }
        async function createRide() {
    const token = localStorage.getItem('token')
    if (!token) {
        alert("Please login first")
        return
    }

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/rides/create`,
            { pickup, destination, vehicleType },
            { headers: { Authorization: `Bearer ${token}` }}
        )

        console.log(response.data)
         setLookingForDriver(true)     
        setConfirmRidePanel(false) 

    } catch (err) {
        console.error("Error creating ride:", err.response?.data || err.message)
        alert("Failed to create ride")
    }
}

    return (
        <div className='h-screen relative overflow-hidden'>
           <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" />

        <div className='h-full w-screen absolute top-0 left-0 z-0'>
             <LiveTracking />
        </div>

             <div className=' flex flex-col justify-end h-screen absolute top-0 w-full pointer-events-none'>
                <div className='h-[36%] p-6 bg-white relative pointer-events-auto'>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                        setVehicleFound(false)
                        setConfirmRidePanel(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('pickup')
                                setVehicleFound(false)
                                setConfirmRidePanel(false)
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('destination')
                                setVehicleFound(false)
                                setConfirmRidePanel(false)
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                            type="text"
                            placeholder='Enter your destination' />
                    </form>
                     <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>

                <div ref={panelRef} className='bg-white h-0 overflow-hidden pointer-events-auto'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>

              <div ref={VehiclePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
             <div ref={confirmRidePanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                               
                    setConfirmRidePanel={setConfirmRidePanel} 
                    setLookingForDriver={setLookingForDriver}
                    />
            </div> 
              
  <div
  ref={lookingForDriverRef}
  className='fixed w-full z-40 bottom-0 bg-white px-3 py-6 pt-12 max-h-[70vh]'
>
  <LookingForDriver
    pickup={pickup}
    destination={destination}
    fare={fare}
    vehicleType={vehicleType}
  />
</div>

<div
  ref={waitingForDriverRef}
  className="fixed w-full z-50 bottom-0 bg-white px-3 py-6 pt-12"
>
  <WaitingForDriver
    ride={ride}
    setWaitingForDriver={setWaitingForDriver}
  />
</div>
        </div>
    )
}

export default Home

