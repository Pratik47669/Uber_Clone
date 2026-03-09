import React from 'react'

const RidePopUp = (props) => {
  const ride = props.ride;

  if (!ride || !ride.user) return null; // crash avoid

  // Correctly handle optional chaining + default values
const firstName = ride.user.fullName?.firstName || "Unknown";
const lastName = ride.user.fullName?.lastName || "";

  return (
    <div>
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
        props.setRidePopupPanel(false)
      }}>
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>

      <div className='flex items-center justify-between p-2 bg-yellow-400 rounded-lg mt-4'>
        <div className='flex items-center gap-3'>
          <img className='h-12 rounded-full object-cover w-12' src="https://thumbs.dreamstime.com/b/portrait-attractive-young-woman-who-sitting-cafe-cafe-urban-lifestyle-random-portrait-portrait-attractive-184127346.jpg" alt="" />
          <h2 className='text-lg font-medium'>{firstName + " " + lastName}</h2>
        </div>
        <h5 className='text-lg font-semibold'>2.2 KM</h5>
      </div>

      {/* Pickup, Destination, Fare */}
      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full mt-5'>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Pickup</h3>
              <p className='text-sm -mt-1 text-gray-600'>{ride.pickup}</p>
            </div>
          </div>

          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Destination</h3>
              <p className='text-sm -mt-1 text-gray-600'>{ride.destination}</p>
            </div>
          </div>

          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-line"></i>
            <div>
              <h3 className='text-lg font-medium'>₹{ride.fare}</h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash</p>
            </div>
          </div>
        </div>

        <div className='flex mt-5 w-full items-center justify-between'>
          <button onClick={() => props.setRidePopupPanel(false)} className='mt-1 bg-gray-300 text-gray-700 font-semibold p-3 px-10 rounded-lg'>Ignore</button>
          <button onClick={() => {
            props.setConfirmRidePopupPanel(true)
            props.confirmRide && props.confirmRide()
          }} className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Accept</button>
        </div>
      </div>
    </div>
  )
}

export default RidePopUp